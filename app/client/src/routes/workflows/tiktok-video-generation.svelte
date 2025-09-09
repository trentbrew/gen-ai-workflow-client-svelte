<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js';
  import * as Input from '$lib/components/ui/input/index.js';
  import * as Label from '$lib/components/ui/label/index.js';
  import * as Textarea from '$lib/components/ui/textarea/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Separator from '$lib/components/ui/separator/index.js';
  import {
    Loader2,
    Video,
    Image,
    Type,
    Download,
    Upload,
    FileText,
    Globe,
  } from '@lucide/svelte';

  export const selected = 'tiktok-video-generation';
  export let apiUrl: string;
  export let onResult: (data: any) => void = () => {};

  // Expose the run function, populateTestData function, and progress data for the parent component
  export {
    run,
    populateTestData,
    progressUpdates,
    currentProgress,
    currentMessage,
  };

  // Brand information - Updated to match brand template
  let brandName = '';
  let website = '';
  let coreIdentity = '';
  let valueProposition = '';
  let tagline = '';
  let keyMessages = '';
  let competitivePositioning = '';
  let brandFiles: File[] = [];
  let musicFile: File | null = null;

  // Video configuration
  let totalDuration = 15;
  let clipDuration = 15;
  let videoClips = 1;
  let imageClips = 0;
  let textBlocks = 1;
  let maxTextLength = 50;
  let isLoading = false;
  let result: any = null;
  let progressUpdates: any[] = [];
  let currentProgress = 0;
  let currentMessage = '';

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      brandFiles = Array.from(files);
    }
  }

  function handleMusicSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      musicFile = file;
    }
  }

  async function run() {
    if (
      !brandName.trim() &&
      !website.trim() &&
      !coreIdentity.trim() &&
      !valueProposition.trim() &&
      !tagline.trim() &&
      brandFiles.length === 0
    ) {
      onResult({
        error: 'Please provide at least one piece of brand information',
      });
      return;
    }

    isLoading = true;
    result = null;
    progressUpdates = [];
    currentProgress = 0;
    currentMessage = '';

    // Generate session ID for progress tracking
    const sessionId = crypto.randomUUID();

    // Set up SSE connection for real-time progress updates
    const eventSource = new EventSource(`${apiUrl}/progress/${sessionId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        if (data.type === 'progress') {
          progressUpdates = [...progressUpdates, data];
          currentProgress = data.progress;
          currentMessage = data.message;
          console.log('Progress updated:', data.progress, data.message);
        } else if (data.type === 'error') {
          progressUpdates = [...progressUpdates, data];
          currentMessage = data.message;
          console.log('Error received:', data.message);
        } else if (data.type === 'connected') {
          console.log('SSE connected with sessionId:', data.sessionId);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    try {
      const formData = new FormData();

      // Add brand materials
      brandFiles.forEach((file) => {
        formData.append('brandMaterials', file);
      });

      // Add music file if provided
      if (musicFile) {
        formData.append('musicFile', musicFile);
      }

      // Add brand information - Updated to match brand template
      if (brandName) formData.append('brandName', brandName);
      if (website) formData.append('website', website);
      if (coreIdentity) formData.append('coreIdentity', coreIdentity);
      if (valueProposition)
        formData.append('valueProposition', valueProposition);
      if (tagline) formData.append('tagline', tagline);
      if (keyMessages) formData.append('keyMessages', keyMessages);
      if (competitivePositioning)
        formData.append('competitivePositioning', competitivePositioning);

      // Add video configuration
      formData.append('totalDuration', totalDuration.toString());
      formData.append('clipDuration', clipDuration.toString());
      formData.append('videoClips', videoClips.toString());
      formData.append('imageClips', imageClips.toString());
      formData.append('textBlocks', textBlocks.toString());
      formData.append('maxTextLength', maxTextLength.toString());

      // Add session ID for progress tracking
      formData.append('sessionId', sessionId);

      const res = await fetch(`${apiUrl}/workflows/tiktok-video-generation`, {
        method: 'POST',
        body: formData,
      });

      const response = await res.json();
      result = response;
      onResult(response);
    } catch (error: any) {
      onResult({ error: error.message });
    } finally {
      isLoading = false;
      eventSource.close();
    }
  }

  function downloadScript() {
    if (result?.scriptUrl) {
      const link = document.createElement('a');
      link.href = `${apiUrl}${result.scriptUrl}`;
      link.download = 'tiktok-video-script.json';
      link.click();
    }
  }

  function populateTestData() {
    // Populate form with realistic test data
    brandName = 'PlushPop AI';
    website = 'https://plushpop.ai';
    coreIdentity =
      'PlushPop AI is an innovative artificial intelligence platform that transforms how businesses create and manage their digital content. We specialize in automated video generation, brand storytelling, and creative asset production using cutting-edge AI technology.';
    valueProposition =
      'Save 80% of your content creation time while maintaining professional quality. Our AI-powered platform generates engaging TikTok videos, social media content, and marketing materials in minutes, not hours. Perfect for small businesses, content creators, and marketing teams who want to scale their content production without scaling their budget.';
    tagline = 'Unleash Your Imagination';
    keyMessages =
      '1. AI-powered content creation that saves time and money\n2. Professional-quality videos generated in minutes\n3. Easy-to-use platform for businesses of all sizes\n4. Customizable brand templates and styles\n5. Scalable solution that grows with your business';
    competitivePositioning =
      'Unlike traditional video production agencies that charge thousands per video, or basic AI tools that produce generic content, PlushPop AI offers the perfect balance of quality, customization, and affordability. We combine the speed of AI automation with the personalization of human creativity, delivering brand-specific content that actually converts.';

    // Set reasonable video configuration
    totalDuration = 15;
    clipDuration = 15;
    videoClips = 1;
    imageClips = 0;
    textBlocks = 1;
    maxTextLength = 50;
  }
</script>

<div class="space-y-4 p-4">
  <!-- Brand Information -->
  <div class="space-y-4">
    <div class="flex flex-col items-start gap-2">
      <h3 class="text-xl font-normal">
        <span
          class="bg-muted-foreground mr-1 px-2 py-1 scale-75 text-sm text-background font-bold rounded-full"
          >1</span
        > Product / Service
      </h3>
      <p class="text-xs text-muted-foreground mb-4">
        Describe your product or service in a way that is easy to understand and
        engaging.
      </p>
      <Separator.Root class="mt-1" />
    </div>

    <!-- Brand Name -->
    <div class="space-y-2">
      <Label.Root for="brandName">Brand Name</Label.Root>
      <Input.Root
        id="brandName"
        bind:value={brandName}
        placeholder="PlushPop AI"
        class="w-full"
      />
    </div>

    <!-- Website -->
    <div class="space-y-2">
      <Label.Root for="website">Website (Optional)</Label.Root>
      <Input.Root
        id="website"
        bind:value={website}
        placeholder="https://plushpop.ai"
        class="w-full"
      />
    </div>

    <!-- Core Identity -->
    <div class="space-y-2">
      <Label.Root for="coreIdentity">Core Identity</Label.Root>
      <Textarea.Root
        id="coreIdentity"
        bind:value={coreIdentity}
        placeholder="Describe what your brand is and what it does..."
        class="w-full min-h-[100px]"
      />
    </div>

    <!-- Value Proposition -->
    <div class="space-y-2">
      <Label.Root for="valueProposition">Value Proposition</Label.Root>
      <Textarea.Root
        id="valueProposition"
        bind:value={valueProposition}
        placeholder="What unique value does your brand offer to customers?"
        class="w-full min-h-[100px]"
      />
    </div>

    <!-- Tagline -->
    <div class="space-y-2">
      <Label.Root for="tagline">Tagline</Label.Root>
      <Input.Root
        id="tagline"
        bind:value={tagline}
        placeholder="'Unleash Your Imagination'"
        class="w-full"
      />
    </div>

    <!-- Key Messages -->
    <div class="space-y-2">
      <Label.Root for="keyMessages">Key Messages</Label.Root>
      <Textarea.Root
        id="keyMessages"
        bind:value={keyMessages}
        placeholder="List your main brand messages or value points..."
        class="w-full min-h-[100px]"
      />
    </div>

    <!-- Competitive Positioning -->
    <div class="space-y-2">
      <Label.Root for="competitivePositioning"
        >Competitive Positioning</Label.Root
      >
      <Textarea.Root
        id="competitivePositioning"
        bind:value={competitivePositioning}
        placeholder="How does your brand differentiate from competitors?"
        class="w-full min-h-[100px]"
      />
    </div>

    <!-- BRAND IDENTITY -->

    <div class="flex flex-col items-start gap-2 mt-12">
      <h3 class="text-xl font-normal">
        <span
          class="bg-muted-foreground mr-1 px-2 py-1 scale-75 text-sm text-background font-bold rounded-full"
          >2</span
        > Brand Identity
      </h3>
      <p class="text-xs text-muted-foreground mb-1">
        Describe your brand, style, and tone.
      </p>
      <Separator.Root class="mt-1" />
    </div>

    <div class="space-y-2">
      <Label.Root for="brandFiles" class="flex items-center gap-2">
        <Upload class="h-4 w-4" />
        Brand Materials (Logo, Images, Documents)
      </Label.Root>
      <Input.Root
        id="brandFiles"
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx"
        onchange={handleFileSelect}
        class="w-full"
      />
      {#if brandFiles.length > 0}
        <div class="text-sm text-muted-foreground">
          Selected {brandFiles.length} file(s): {brandFiles
            .map((f) => f.name)
            .join(', ')}
        </div>
      {/if}
    </div>

    <!-- Music Upload -->
    <div class="space-y-2">
      <Label.Root for="musicFile" class="flex items-center gap-2">
        <Upload class="h-4 w-4" />
        Background Music (Optional)
      </Label.Root>
      <Input.Root
        id="musicFile"
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.aac"
        onchange={handleMusicSelect}
        class="w-full"
      />
      {#if musicFile}
        <div class="text-sm text-muted-foreground">
          Selected: {musicFile.name}
        </div>
      {/if}
      <div class="text-xs text-muted-foreground">
        If no music is provided, the system will use a default track
      </div>
    </div>
  </div>

  <div class="flex flex-col items-start gap-2 mt-12">
    <h3 class="text-xl font-normal">
      <span
        class="bg-muted-foreground mr-1 px-2 py-1 scale-75 text-sm text-background font-bold rounded-full"
        >3</span
      > Video Configuration
    </h3>
    <p class="text-xs text-muted-foreground mb-1">
      Configure your video generation settings.
    </p>
    <Separator.Root class="mt-1" />
  </div>

  <!-- Video Configuration -->
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label.Root for="totalDuration">Total Duration (seconds)</Label.Root>
        <Input.Root
          id="totalDuration"
          type="number"
          bind:value={totalDuration}
          min="1"
          max="60"
          class="w-full"
        />
      </div>
      <div class="space-y-2">
        <Label.Root for="clipDuration"
          >Single Clip Duration (seconds)</Label.Root
        >
        <Input.Root
          id="clipDuration"
          type="number"
          step="0.1"
          bind:value={clipDuration}
          min="5"
          max="30"
          class="w-full"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label.Root for="videoClips">Video Clips (Fixed: 1)</Label.Root>
        <Input.Root
          id="videoClips"
          type="number"
          bind:value={videoClips}
          min="1"
          max="1"
          class="w-full"
          disabled
        />
      </div>
      <div class="space-y-2">
        <Label.Root for="imageClips">Image Clips (Fixed: 0)</Label.Root>
        <Input.Root
          id="imageClips"
          type="number"
          bind:value={imageClips}
          min="0"
          max="0"
          class="w-full"
          disabled
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label.Root for="textBlocks">Text Blocks (Fixed: 1)</Label.Root>
        <Input.Root
          id="textBlocks"
          type="number"
          bind:value={textBlocks}
          min="1"
          max="1"
          class="w-full"
          disabled
        />
      </div>
      <div class="space-y-2">
        <Label.Root for="maxTextLength">Max Text Length (One-liner)</Label.Root>
        <Input.Root
          id="maxTextLength"
          type="number"
          bind:value={maxTextLength}
          min="10"
          max="100"
          class="w-full"
        />
      </div>
    </div>
  </div>

  <!-- Results are now displayed in the right column -->
  <!-- Error display moved to second column in main page -->
</div>

<svelte:head>
  <title>TikTok Video Generation - Turtle Labs AI Studio</title>
</svelte:head>
