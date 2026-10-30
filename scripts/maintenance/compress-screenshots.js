const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots', 'current');
const ARCHIVE_DIR = path.join(__dirname, '..', 'screenshots', 'archive');
const COMPRESSION_AGE_DAYS = 30;  // Compress files older than 30 days

function getFilesOlderThan(directory, days) {
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const cutoffTime = now - (days * millisecondsPerDay);
  const oldFiles = [];

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          walkDir(filePath);
        } else if (stats.isFile() && stats.mtime.getTime() < cutoffTime) {
          oldFiles.push({
            path: filePath,
            name: path.relative(SCREENSHOTS_DIR, filePath),
            age: Math.floor((now - stats.mtime.getTime()) / millisecondsPerDay)
          });
        }
      });
    } catch (error) {
      console.error(`Error walking directory ${dir}:`, error.message);
    }
  }

  walkDir(directory);
  return oldFiles;
}

async function compressOldScreenshots() {
  console.log('\n' + '='.repeat(70));
  console.log('  SCREENSHOT COMPRESSION UTILITY');
  console.log('='.repeat(70) + '\n');

  console.log(`📁 Checking for screenshots older than ${COMPRESSION_AGE_DAYS} days...`);
  console.log(`Source: ${SCREENSHOTS_DIR}`);
  console.log(`Archive: ${ARCHIVE_DIR}\n`);

  // Ensure archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    console.log('✓ Created archive directory\n');
  }

  // Get all old files
  const oldFiles = getFilesOlderThan(SCREENSHOTS_DIR, COMPRESSION_AGE_DAYS);

  if (oldFiles.length === 0) {
    console.log('ℹ No screenshots older than ' + COMPRESSION_AGE_DAYS + ' days found.\n');
    return { compressed: 0, archived: 0 };
  }

  console.log(`📦 Found ${oldFiles.length} files to compress:\n`);
  oldFiles.forEach(file => {
    console.log(`   • ${file.name} (${file.age} days old)`);
  });
  console.log();

  // Group files by module
  const filesByModule = {};
  oldFiles.forEach(file => {
    const module = file.name.split('/')[0];
    if (!filesByModule[module]) {
      filesByModule[module] = [];
    }
    filesByModule[module].push(file);
  });

  let totalCompressed = 0;
  let totalSize = 0;

  // Create a ZIP for each module
  for (const [module, files] of Object.entries(filesByModule)) {
    const archiveName = `${module}-screenshots-${Date.now()}.zip`;
    const archivePath = path.join(ARCHIVE_DIR, archiveName);

    console.log(`🗂️  Compressing ${module} module (${files.length} files)...`);

    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', () => {
        const stats = fs.statSync(archivePath);
        console.log(`   ✓ Archived: ${archiveName} (${(stats.size / 1024).toFixed(2)} KB)\n`);
        totalCompressed += files.length;
        totalSize += stats.size;
        resolve();
      });

      archive.on('error', reject);
      output.on('error', reject);

      archive.pipe(output);

      files.forEach(file => {
        archive.file(file.path, { name: path.basename(file.path) });
      });

      archive.finalize();
    });

    // Delete original files after archiving
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`   ⚠️  Failed to delete ${file.name}: ${error.message}`);
      }
    });
  }

  console.log('='.repeat(70));
  console.log('COMPRESSION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✓ Total files compressed: ${totalCompressed}`);
  console.log(`✓ Total archive size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✓ Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(70) + '\n');

  return { compressed: totalCompressed, archived: 1, size: totalSize };
}

// Run if executed directly
if (require.main === module) {
  compressOldScreenshots().catch(error => {
    console.error('✗ Compression failed:', error);
    process.exit(1);
  });
}

module.exports = compressOldScreenshots;
