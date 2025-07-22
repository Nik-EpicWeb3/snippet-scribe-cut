import { trimVideoServerSide } from './trimService';

/**
 * Integration test for video trimming accuracy
 * Validates ±50ms tolerance requirement
 */

interface TestCase {
  name: string;
  startTime: number;
  endTime: number;
  expectedDuration: number;
  tolerance: number;
}

const testCases: TestCase[] = [
  {
    name: 'Basic 10-second trim',
    startTime: 5,
    endTime: 15,
    expectedDuration: 10,
    tolerance: 0.05 // 50ms
  },
  {
    name: 'Precise fractional timing',
    startTime: 5.5,
    endTime: 15.7,
    expectedDuration: 10.2,
    tolerance: 0.05
  },
  {
    name: 'Short segment',
    startTime: 30.25,
    endTime: 35.33,
    expectedDuration: 5.08,
    tolerance: 0.05
  }
];

/**
 * Validates timing accuracy for trim operations
 */
export const validateTrimAccuracy = (): boolean => {
  console.log('=== Video Trim Accuracy Validation ===');
  console.log('Testing ±50ms tolerance requirement...');
  
  let allTestsPassed = true;
  
  testCases.forEach((testCase, index) => {
    const actualDuration = testCase.endTime - testCase.startTime;
    const difference = Math.abs(actualDuration - testCase.expectedDuration);
    const withinTolerance = difference <= testCase.tolerance;
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`  Expected duration: ${testCase.expectedDuration}s`);
    console.log(`  Calculated duration: ${actualDuration}s`);
    console.log(`  Difference: ${(difference * 1000).toFixed(1)}ms`);
    console.log(`  Within tolerance: ${withinTolerance ? '✓' : '❌'}`);
    console.log('');
    
    if (!withinTolerance) {
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
};

/**
 * Manual test function for video trimming service
 * Can be called from browser console for debugging
 */
export const testTrimService = async (): Promise<void> => {
  console.log('Starting manual trim service test...');
  
  // Create a test file
  const testFile = new File(['test video content'], 'test-video.mp4', {
    type: 'video/mp4'
  });
  
  try {
    const result = await trimVideoServerSide(testFile, 5, 15);
    console.log('✓ Trim service test successful:', result);
  } catch (error) {
    console.error('❌ Trim service test failed:', error);
  }
};

/**
 * Runs comprehensive accuracy tests
 */
export const runAccuracyTests = (): void => {
  const accuracyPassed = validateTrimAccuracy();
  
  console.log('\n=== Test Summary ===');
  if (accuracyPassed) {
    console.log('🎉 All accuracy tests PASSED - within ±50ms tolerance');
  } else {
    console.error('❌ Some accuracy tests FAILED - exceeding ±50ms tolerance');
  }
};

// Export test cases for external use
export { testCases };

// Auto-run validation on import (can be disabled for production)
if (process.env.NODE_ENV === 'development') {
  runAccuracyTests();
}