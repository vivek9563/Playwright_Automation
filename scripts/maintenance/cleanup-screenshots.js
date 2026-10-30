const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '..', 'screenshots', 'archive');
const ARCHIVE_AGE_DAYS = 30;  // Delete archives older than 30 days

function getFilesOlderThan(directory, days) {
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const cutoffTime = now - (days * millisecondsPerDay);
  const oldFiles = [];

  try {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && stats.mtime.getTime() < cutoffTime) {
        oldFiles.push({
          path: filePath,
          name: file,
          age: Math.floor((now - stats.mtime.getTime()) / millisecondsPerDay),
          size: stats.size
        });
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message);
  }

  return oldFiles;
}

async function cleanupOldArchives() {
  console.log('\n' + '='.repeat(70));
  console.log('  SCREENSHOT ARCHIVE CLEANUP UTILITY');
  console.log('='.repeat(70) + '\n');

  console.log(`🗑️  Checking for archived files older than ${ARCHIVE_AGE_DAYS} days...`);
  console.log(`Location: ${ARCHIVE_DIR}\n`);

  // Check if archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    console.log('ℹ Archive directory does not exist. No cleanup needed.\n');
    return { deleted: 0, freed: 0 };
  }

  // Get all old archives
  const oldArchives = getFilesOlderThan(ARCHIVE_DIR, ARCHIVE_AGE_DAYS);

  if (oldArchives.length === 0) {
    console.log(`ℹ No archived files older than ${ARCHIVE_AGE_DAYS} days found.\n`);
    return { deleted: 0, freed: 0 };
  }

  console.log(`📦 Found ${oldArchives.length} archives to delete:\n`);
  let totalSize = 0;
  oldArchives.forEach(file => {
    console.log(`   • ${file.name} (${file.age} days old, ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    totalSize += file.size;
  });
  console.log();

  // Delete old archives
  let deleted = 0;
  oldArchives.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      deleted++;
      console.log(`✓ Deleted: ${file.name}`);
    } catch (error) {
      console.error(`✗ Failed to delete ${file.name}: ${error.message}`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('CLEANUP SUMMARY');
  console.log('='.repeat(70));
  console.log(`✓ Total files deleted: ${deleted}`);
  console.log(`✓ Storage freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✓ Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(70) + '\n');

  return { deleted, freed: totalSize };
}

// Run if executed directly
if (require.main === module) {
  cleanupOldArchives().catch(error => {
    console.error('✗ Cleanup failed:', error);
    process.exit(1);
  });
}

module.exports = cleanupOldArchives;
