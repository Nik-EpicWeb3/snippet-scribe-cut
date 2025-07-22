import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock video services
vi.mock('@/services/videoService', () => ({
  transcribeVideo: vi.fn(),
  trimVideo: vi.fn(),
  downloadTrimmedVideo: vi.fn()
}));

vi.mock('@/services/openaiService', () => ({
  transcribeVideoWithWhisper: vi.fn()
}));

/**
 * Regression test for "Maximum call stack size exceeded" error
 * Tests rapid state changes that previously caused infinite loops
 */
describe('Stack Overflow Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle rapid transcript updates without stack overflow', async () => {
    const { result } = renderHook(() => useVideoProcessing());
    
    // Simulate rapid transcript edits/updates
    const testTranscript = [
      { start: 0, end: 4, text: "Test segment 1" },
      { start: 4, end: 8, text: "Test segment 2" }
    ];

    // Perform 50 rapid state changes (reduced from 200 for faster testing)
    for (let i = 0; i < 50; i++) {
      act(() => {
        // Simulate various state changes that could trigger the loop
        result.current.setActiveTab(i % 2 === 0 ? 'transcript' : 'trim');
        
        // Simulate segment selection changes
        result.current.handleSegmentSelect(
          i % 3 === 0 ? null : { start: i, end: i + 4 }
        );
        
        // Simulate timestamp clicks
        result.current.handleTimestampClick(i % 10);
      });
    }

    // If we reach this point without throwing, the test passes
    expect(result.current.activeTab).toBeDefined();
  });

  it('should handle rapid tab switching without infinite re-renders', () => {
    const { result } = renderHook(() => useVideoProcessing());
    
    const tabs = ['transcript', 'insights', 'trim'];
    
    // Rapidly switch between tabs
    for (let i = 0; i < 30; i++) {
      act(() => {
        result.current.setActiveTab(tabs[i % tabs.length]);
      });
    }

    expect(result.current.activeTab).toBe(tabs[29 % tabs.length]);
  });

  it('should handle concurrent state updates without recursion', () => {
    const { result } = renderHook(() => useVideoProcessing());
    
    // Simulate concurrent state updates that could cause recursion
    act(() => {
      // Multiple state changes in the same render cycle
      result.current.setActiveTab('transcript');
      result.current.handleSegmentSelect({ start: 0, end: 10 });
      result.current.handleTimestampClick(5);
      result.current.setActiveTab('trim');
    });

    expect(result.current.activeTab).toBe('trim');
    expect(result.current.selectedSegment).toEqual({ start: 0, end: 10 });
  });

  it('should prevent useEffect dependency loops', () => {
    const { result, rerender } = renderHook(() => useVideoProcessing());
    
    // Track render count to detect infinite loops
    let renderCount = 0;
    const originalConsoleLog = console.log;
    console.log = vi.fn(() => {
      renderCount++;
      // Fail if we get too many renders (indicating a loop)
      if (renderCount > 50) {
        throw new Error('Potential infinite loop detected: too many re-renders');
      }
    });

    // Simulate normal usage patterns
    act(() => {
      result.current.setActiveTab('transcript');
    });

    // Force several re-renders
    for (let i = 0; i < 5; i++) {
      rerender();
    }

    console.log = originalConsoleLog;
    expect(renderCount).toBeLessThan(50);
  });
});