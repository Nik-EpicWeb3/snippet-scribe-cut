
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getOpenAIApiKey, setOpenAIApiKey, clearOpenAIApiKey } from '@/services/openaiService';
import { Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const OpenAISetup: React.FC<{ className?: string }> = ({ className }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = getOpenAIApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySet(true);
      setKeyStatus('valid');
    }
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Validate the API key by making a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        setOpenAIApiKey(apiKey);
        setIsKeySet(true);
        setKeyStatus('valid');
        toast({
          title: "API Key Saved",
          description: "Your OpenAI API key has been saved successfully",
        });
      } else {
        setKeyStatus('invalid');
        toast({
          title: "Invalid API Key",
          description: "The API key you entered is invalid or has expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating API key:", error);
      setKeyStatus('invalid');
      toast({
        title: "Validation Error",
        description: "Could not validate your API key. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = () => {
    clearOpenAIApiKey();
    setApiKey('');
    setIsKeySet(false);
    setKeyStatus('none');
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed",
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Setup
        </CardTitle>
        <CardDescription>
          Enter your OpenAI API key to enable AI-powered transcription and insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={`pr-10 ${keyStatus === 'invalid' ? 'border-red-500' : ''}`}
            disabled={isValidating}
          />
          {keyStatus === 'valid' && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {keyStatus === 'invalid' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        {keyStatus === 'invalid' && (
          <p className="text-red-500 text-sm mt-1">Invalid API key. Please check and try again.</p>
        )}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Your API key is stored locally in your browser and never sent to our servers.</p>
          <p className="mt-2">
            Need an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one from OpenAI</a>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearKey} disabled={!isKeySet || isValidating}>
          Clear Key
        </Button>
        <Button onClick={handleSaveKey} disabled={isValidating}>
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating
            </>
          ) : (
            'Save Key'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OpenAISetup;
