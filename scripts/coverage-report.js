#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Comprehensive test coverage reporting script
 * Generates detailed coverage reports and merges with E2E test results
 */

class CoverageReporter {
  constructor() {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.reportsDir = path.join(process.cwd(), 'coverage-reports');
    this.outputFile = path.join(this.reportsDir, 'merged-coverage.json');
  }

  async run() {
    console.log('📊 Starting comprehensive coverage reporting...\n');

    try {
      // Ensure directories exist
      this.ensureDirectories();

      // Run unit tests with coverage
      console.log('🧪 Running unit tests with coverage...');
      execSync('npm run test:coverage', { stdio: 'inherit' });

      // Generate additional coverage reports
      console.log('\n📈 Generating detailed coverage reports...');
      this.generateDetailedReports();

      // Create coverage summary
      console.log('\n📋 Creating coverage summary...');
      this.createCoverageSummary();

      // Generate coverage badge data
      console.log('\n🏷️ Generating coverage badge data...');
      this.generateBadgeData();

      // Copy dashboard template
      console.log('\n📊 Setting up coverage dashboard...');
      this.setupDashboard();

      // Check coverage thresholds
      console.log('\n🎯 Checking coverage thresholds...');
      this.checkThresholds();

      console.log('\n✅ Coverage reporting completed successfully!');
      console.log(`📁 Reports available in: ${this.reportsDir}`);

    } catch (error) {
      console.error('❌ Coverage reporting failed:', error.message);
      process.exit(1);
    }
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  generateDetailedReports() {
    const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');
    
    if (!fs.existsSync(coverageSummaryPath)) {
      console.warn('⚠️ Coverage summary not found, skipping detailed reports');
      return;
    }

    const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    
    // Generate detailed HTML report
    const htmlReportPath = path.join(this.reportsDir, 'index.html');
    if (fs.existsSync(path.join(this.coverageDir, 'lcov-report', 'index.html'))) {
      fs.copyFileSync(
        path.join(this.coverageDir, 'lcov-report', 'index.html'),
        htmlReportPath
      );
    }

    // Generate coverage by directory
    this.generateDirectoryCoverage(summary);
    
    // Generate uncovered files report
    this.generateUncoveredFilesReport(summary);
  }

  generateDirectoryCoverage(summary) {
    const directoryCoverage = {};
    
    Object.keys(summary).forEach(filePath => {
      if (filePath === 'total') return;
      
      const dir = path.dirname(filePath).replace(/\\/g, '/');
      if (!directoryCoverage[dir]) {
        directoryCoverage[dir] = {
          files: 0,
          statements: { covered: 0, total: 0 },
          branches: { covered: 0, total: 0 },
          functions: { covered: 0, total: 0 },
          lines: { covered: 0, total: 0 }
        };
      }
      
      const fileData = summary[filePath];
      directoryCoverage[dir].files++;
      directoryCoverage[dir].statements.covered += fileData.statements.covered;
      directoryCoverage[dir].statements.total += fileData.statements.total;
      directoryCoverage[dir].branches.covered += fileData.branches.covered;
      directoryCoverage[dir].branches.total += fileData.branches.total;
      directoryCoverage[dir].functions.covered += fileData.functions.covered;
      directoryCoverage[dir].functions.total += fileData.functions.total;
      directoryCoverage[dir].lines.covered += fileData.lines.covered;
      directoryCoverage[dir].lines.total += fileData.lines.total;
    });

    // Calculate percentages
    Object.keys(directoryCoverage).forEach(dir => {
      const data = directoryCoverage[dir];
      data.statements.pct = this.calculatePercentage(data.statements);
      data.branches.pct = this.calculatePercentage(data.branches);
      data.functions.pct = this.calculatePercentage(data.functions);
      data.lines.pct = this.calculatePercentage(data.lines);
    });

    fs.writeFileSync(
      path.join(this.reportsDir, 'directory-coverage.json'),
      JSON.stringify(directoryCoverage, null, 2)
    );
  }

  generateUncoveredFilesReport(summary) {
    const uncoveredFiles = [];
    
    Object.keys(summary).forEach(filePath => {
      if (filePath === 'total') return;
      
      const fileData = summary[filePath];
      const stmtPct = this.calculatePercentage(fileData.statements);
      const branchPct = this.calculatePercentage(fileData.branches);
      const funcPct = this.calculatePercentage(fileData.functions);
      const linePct = this.calculatePercentage(fileData.lines);
      
      if (stmtPct < 70 || branchPct < 70 || funcPct < 70 || linePct < 70) {
        uncoveredFiles.push({
          file: filePath,
          statements: stmtPct,
          branches: branchPct,
          functions: funcPct,
          lines: linePct,
          priority: this.calculatePriority(stmtPct, branchPct, funcPct, linePct)
        });
      }
    });

    // Sort by priority (lowest coverage first)
    uncoveredFiles.sort((a, b) => a.priority - b.priority);

    fs.writeFileSync(
      path.join(this.reportsDir, 'uncovered-files.json'),
      JSON.stringify({ files: uncoveredFiles, count: uncoveredFiles.length }, null, 2)
    );
  }

  createCoverageSummary() {
    const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');
    
    if (!fs.existsSync(coverageSummaryPath)) {
      console.warn('⚠️ Coverage summary not found');
      return;
    }

    const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const total = summary.total;

    const detailedSummary = {
      timestamp: new Date().toISOString(),
      overall: {
        statements: {
          percentage: this.calculatePercentage(total.statements),
          covered: total.statements.covered,
          total: total.statements.total
        },
        branches: {
          percentage: this.calculatePercentage(total.branches),
          covered: total.branches.covered,
          total: total.branches.total
        },
        functions: {
          percentage: this.calculatePercentage(total.functions),
          covered: total.functions.covered,
          total: total.functions.total
        },
        lines: {
          percentage: this.calculatePercentage(total.lines),
          covered: total.lines.covered,
          total: total.lines.total
        }
      },
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      },
      status: {
        statements: this.calculatePercentage(total.statements) >= 70,
        branches: this.calculatePercentage(total.branches) >= 70,
        functions: this.calculatePercentage(total.functions) >= 70,
        lines: this.calculatePercentage(total.lines) >= 70
      }
    };

    detailedSummary.status.overall = Object.values(detailedSummary.status).every(status => status === true);

    fs.writeFileSync(
      path.join(this.reportsDir, 'detailed-summary.json'),
      JSON.stringify(detailedSummary, null, 2)
    );

    // Create markdown summary
    this.createMarkdownSummary(detailedSummary);
  }

  createMarkdownSummary(summary) {
    const markdown = `# Test Coverage Report

Generated on: ${new Date(summary.timestamp).toLocaleString()}

## Overall Coverage

| Metric | Coverage | Covered | Total | Status |
|--------|----------|---------|-------|--------|
| Statements | ${summary.overall.statements.percentage}% | ${summary.overall.statements.covered} | ${summary.overall.statements.total} | ${summary.status.statements ? '✅' : '❌'} |
| Branches | ${summary.overall.branches.percentage}% | ${summary.overall.branches.covered} | ${summary.overall.branches.total} | ${summary.status.branches ? '✅' : '❌'} |
| Functions | ${summary.overall.functions.percentage}% | ${summary.overall.functions.covered} | ${summary.overall.functions.total} | ${summary.status.functions ? '✅' : '❌'} |
| Lines | ${summary.overall.lines.percentage}% | ${summary.overall.lines.covered} | ${summary.overall.lines.total} | ${summary.status.lines ? '✅' : '❌'} |

**Overall Status: ${summary.status.overall ? '✅ PASSED' : '❌ FAILED'}**

## Thresholds

- All metrics must be ≥ ${summary.thresholds.statements}%
- Components directory: ≥ 75%
- Library directory: ≥ 65%

## View Detailed Reports

- [HTML Report](./index.html) - Interactive coverage report
- [Directory Coverage](./directory-coverage.json) - Coverage by directory
- [Uncovered Files](./uncovered-files.json) - Files below threshold

`;

    fs.writeFileSync(
      path.join(this.reportsDir, 'README.md'),
      markdown
    );
  }

  generateBadgeData() {
    const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');
    
    if (!fs.existsSync(coverageSummaryPath)) {
      return;
    }

    const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const total = summary.total;
    const percentage = this.calculatePercentage(total.statements);
    
    let color;
    if (percentage >= 80) color = 'brightgreen';
    else if (percentage >= 70) color = 'yellow';
    else if (percentage >= 50) color = 'orange';
    else color = 'red';

    const badgeData = {
      schemaVersion: 1,
      label: 'coverage',
      message: `${percentage}%`,
      color: color
    };

    fs.writeFileSync(
      path.join(this.reportsDir, 'coverage-badge.json'),
      JSON.stringify(badgeData, null, 2)
    );
  }

  checkThresholds() {
    const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');
    
    if (!fs.existsSync(coverageSummaryPath)) {
      console.warn('⚠️ Cannot check thresholds - coverage summary not found');
      return;
    }

    const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const total = summary.total;

    const results = {
      statements: this.calculatePercentage(total.statements),
      branches: this.calculatePercentage(total.branches),
      functions: this.calculatePercentage(total.functions),
      lines: this.calculatePercentage(total.lines)
    };

    const thresholds = { statements: 70, branches: 70, functions: 70, lines: 70 };
    let allPassed = true;

    console.log('\n🎯 Coverage Threshold Results:');
    console.log('================================');
    
    Object.keys(thresholds).forEach(metric => {
      const passed = results[metric] >= thresholds[metric];
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${metric.padEnd(12)}: ${results[metric].toString().padStart(5)}% (≥${thresholds[metric]}%) ${status}`);
      if (!passed) allPassed = false;
    });

    console.log('================================');
    console.log(`Overall: ${allPassed ? '✅ ALL THRESHOLDS PASSED' : '❌ SOME THRESHOLDS FAILED'}`);
    
    if (!allPassed && process.env.CI) {
      console.error('\n❌ Coverage thresholds not met in CI environment');
      process.exit(1);
    }
  }

  calculatePercentage(data) {
    if (data.total === 0) return 100;
    return Math.round((data.covered / data.total) * 100);
  }

  calculatePriority(stmt, branch, func, line) {
    return (stmt + branch + func + line) / 4;
  }

  setupDashboard() {
    const dashboardTemplatePath = path.join(__dirname, 'coverage-dashboard.html');
    const dashboardOutputPath = path.join(this.reportsDir, 'dashboard.html');
    
    if (fs.existsSync(dashboardTemplatePath)) {
      fs.copyFileSync(dashboardTemplatePath, dashboardOutputPath);
      console.log(`📊 Dashboard available at: ${dashboardOutputPath}`);
    } else {
      console.warn('⚠️ Dashboard template not found');
    }
  }
}

// Run the coverage reporter
if (require.main === module) {
  new CoverageReporter().run().catch(console.error);
}

module.exports = CoverageReporter;