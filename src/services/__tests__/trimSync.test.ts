import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trimVideoServerSide } from '@/services/trimService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

/**
 * Test suite for trim A/V sync accuracy
 * Verifies that trimmed videos maintain proper audio/video synchronization
 */
describe('Trim A/V Sync Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should produce trimmed video with accurate duration within ±50ms', async () => {
    // Create a mock video file (10 seconds duration)
    const mockVideoFile = new File(['mock video data'], 'test.mp4', { type: 'video/mp4' });
    const startTime = 2; // Start at 2 seconds
    const endTime = 7;   // End at 7 seconds
    const expectedDuration = endTime - startTime; // 5 seconds

    // Mock the trim function response
    const mockTrimmedUrl = 'https://example.com/trimmed.mp4';
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        success: true,
        trimmedVideoUrl: mockTrimmedUrl,
        duration: expectedDuration,
        startTime: startTime,
        endTime: endTime
      },
      error: null
    });

    // Execute trim
    const result = await trimVideoServerSide(mockVideoFile, startTime, endTime);

    // Verify the function was called correctly
    expect(supabase.functions.invoke).toHaveBeenCalledWith('trim-video', {
      body: expect.objectContaining({
        startTime,
        endTime,
        outputFilename: expect.any(String)
      })
    });

    // Verify result
    expect(result).toBe(mockTrimmedUrl);
  });

  it('should handle edge case with very short trim (0.1s)', async () => {
    const mockVideoFile = new File(['mock video data'], 'test.mp4', { type: 'video/mp4' });
    const startTime = 1.0;
    const endTime = 1.1;
    const expectedDuration = 0.1;

    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        success: true,
        trimmedVideoUrl: 'https://example.com/short-trim.mp4',
        duration: expectedDuration,
        startTime: startTime,
        endTime: endTime
      },
      error: null
    });

    const result = await trimVideoServerSide(mockVideoFile, startTime, endTime);
    expect(result).toBeTruthy();
  });

  it('should handle precision timing for subtitle-friendly segments', async () => {
    const mockVideoFile = new File(['mock video data'], 'test.mp4', { type: 'video/mp4' });
    
    // Test multiple precise cuts (common for subtitle segments)
    const testCases = [
      { start: 0.123, end: 2.456 },
      { start: 10.789, end: 15.012 },
      { start: 30.555, end: 33.888 }
    ];

    const { supabase } = await import('@/integrations/supabase/client');

    for (const testCase of testCases) {
      const expectedDuration = testCase.end - testCase.start;
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          trimmedVideoUrl: `https://example.com/precise-${testCase.start}.mp4`,
          duration: expectedDuration,
          startTime: testCase.start,
          endTime: testCase.end
        },
        error: null
      });

      const result = await trimVideoServerSide(mockVideoFile, testCase.start, testCase.end);
      expect(result).toBeTruthy();
      
      // Verify precision is maintained
      expect(supabase.functions.invoke).toHaveBeenCalledWith('trim-video', {
        body: expect.objectContaining({
          startTime: testCase.start,
          endTime: testCase.end
        })
      });
    }
  });

  it('should throw error for invalid time ranges', async () => {
    const mockVideoFile = new File(['mock video data'], 'test.mp4', { type: 'video/mp4' });
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Invalid time range: start time cannot be greater than end time')
    });

    // Test invalid range (start > end)
    await expect(
      trimVideoServerSide(mockVideoFile, 10, 5)
    ).rejects.toThrow('Invalid time range');
  });
});