<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js';
  import * as Input from '$lib/components/ui/input/index.js';
  import * as Label from '$lib/components/ui/label/index.js';
  import * as Switch from '$lib/components/ui/switch/index.js';
  import { Loader2 } from '@lucide/svelte';

  export let apiUrl: string;
  export let onResult: (data: any) => void = () => {};

  let prompt = "What's the weather like in San Francisco?";
  let isLoading = false;
  let useWeatherFunction = true;
  let useCalendarFunction = false;
  let useLightControlFunction = false;
  let useMusicFunction = false;
  let useDiscoBallFunction = false;
  let functionCallingMode = 'AUTO';

  // Enhanced function declarations
  const weatherFunction = {
    name: 'get_current_weather',
    description:
      'Get the current weather in a given location with detailed information',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description:
            'The city and state, e.g., San Francisco, CA or a zip code e.g., 95616',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description:
            "The temperature unit to use. Infer this from the user's location.",
        },
      },
      required: ['location'],
    },
  };

  const calendarFunction = {
    name: 'schedule_meeting',
    description:
      'Schedule a meeting with specified attendees at a given time and date',
    parameters: {
      type: 'object',
      properties: {
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of people attending the meeting',
        },
        date: {
          type: 'string',
          description: 'Date of the meeting (e.g., "2024-07-29")',
        },
        time: {
          type: 'string',
          description: 'Time of the meeting (e.g., "15:00")',
        },
        topic: {
          type: 'string',
          description: 'The subject or topic of the meeting',
        },
        duration: {
          type: 'integer',
          description: 'Duration of the meeting in minutes (default: 30)',
        },
      },
      required: ['attendees', 'date', 'time', 'topic'],
    },
  };

  const lightControlFunction = {
    name: 'set_light_values',
    description: 'Sets the brightness and color temperature of a light',
    parameters: {
      type: 'object',
      properties: {
        brightness: {
          type: 'number',
          description:
            'Light level from 0 to 100. Zero is off and 100 is full brightness',
        },
        color_temp: {
          type: 'string',
          enum: ['daylight', 'cool', 'warm'],
          description:
            'Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`',
        },
      },
      required: ['brightness', 'color_temp'],
    },
  };

  const musicFunction = {
    name: 'start_music',
    description: 'Play some music matching the specified parameters',
    parameters: {
      type: 'object',
      properties: {
        energetic: {
          type: 'boolean',
          description: 'Whether the music is energetic or not',
        },
        loud: {
          type: 'boolean',
          description: 'Whether the music is loud or not',
        },
        genre: {
          type: 'string',
          description: 'Music genre preference',
        },
      },
      required: ['energetic', 'loud'],
    },
  };

  const discoBallFunction = {
    name: 'power_disco_ball',
    description: 'Powers the spinning disco ball',
    parameters: {
      type: 'object',
      properties: {
        power: {
          type: 'boolean',
          description: 'Whether to turn the disco ball on or off',
        },
      },
      required: ['power'],
    },
  };

  async function run() {
    if (!prompt.trim()) {
      onResult({ error: 'Please enter a prompt' });
      return;
    }

    isLoading = true;
    try {
      // Build functions array based on switches
      const functions = [];
      if (useWeatherFunction) functions.push(weatherFunction);
      if (useCalendarFunction) functions.push(calendarFunction);
      if (useLightControlFunction) functions.push(lightControlFunction);
      if (useMusicFunction) functions.push(musicFunction);
      if (useDiscoBallFunction) functions.push(discoBallFunction);

      if (functions.length === 0) {
        onResult({ error: 'Please select at least one function' });
        return;
      }

      const res = await fetch(`${apiUrl}/workflows/function-calling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, functions, mode: functionCallingMode }),
      });

      const response = await res.json();
      onResult(response);
    } catch (error: any) {
      onResult({ error: error.message });
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-6 p-4">
  <!-- Prompt Input -->
  <div class="space-y-2">
    <Label.Root for="prompt">Prompt</Label.Root>
    <Input.Root
      id="prompt"
      bind:value={prompt}
      placeholder="Ask about the weather, schedule a meeting, or control smart devices"
      class="w-full"
    />
  </div>

  <!-- Function Calling Mode -->
  <div class="space-y-2">
    <Label.Root for="mode">Function Calling Mode</Label.Root>
    <select
      id="mode"
      bind:value={functionCallingMode}
      class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="AUTO">AUTO - Model decides when to call functions</option>
      <option value="ANY">ANY - Force function call if applicable</option>
      <option value="NONE">NONE - Disable function calling</option>
    </select>
  </div>

  <!-- Available Functions -->
  <div class="space-y-4">
    <Label.Root class="text-sm font-medium">Available Functions</Label.Root>

    <div class="grid grid-cols-1 gap-3">
      <div class="flex items-center space-x-2 p-3 border rounded-lg">
        <Switch.Root bind:checked={useWeatherFunction} />
        <div class="flex-1">
          <Label.Root for="weather-function" class="text-sm font-medium"
            >Weather Function</Label.Root
          >
          <p class="text-xs text-muted-foreground">
            Get current weather information for any location
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2 p-3 border rounded-lg">
        <Switch.Root bind:checked={useCalendarFunction} />
        <div class="flex-1">
          <Label.Root for="calendar-function" class="text-sm font-medium"
            >Calendar Function</Label.Root
          >
          <p class="text-xs text-muted-foreground">
            Schedule meetings with multiple attendees
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2 p-3 border rounded-lg">
        <Switch.Root bind:checked={useLightControlFunction} />
        <div class="flex-1">
          <Label.Root for="light-function" class="text-sm font-medium"
            >Light Control Function</Label.Root
          >
          <p class="text-xs text-muted-foreground">
            Control smart lights (brightness and color temperature)
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2 p-3 border rounded-lg">
        <Switch.Root bind:checked={useMusicFunction} />
        <div class="flex-1">
          <Label.Root for="music-function" class="text-sm font-medium"
            >Music Function</Label.Root
          >
          <p class="text-xs text-muted-foreground">
            Play music with customizable energy and volume
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2 p-3 border rounded-lg">
        <Switch.Root bind:checked={useDiscoBallFunction} />
        <div class="flex-1">
          <Label.Root for="disco-function" class="text-sm font-medium"
            >Disco Ball Function</Label.Root
          >
          <p class="text-xs text-muted-foreground">
            Control the party disco ball
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Run Button -->
  <Button.Root
    onclick={run}
    disabled={isLoading ||
      !prompt.trim() ||
      (!useWeatherFunction &&
        !useCalendarFunction &&
        !useLightControlFunction &&
        !useMusicFunction &&
        !useDiscoBallFunction)}
    class="w-full sticky bottom-4"
  >
    {#if isLoading}
      <span class="flex items-center gap-2">
        <Loader2 class="h-4 w-4 animate-spin" />
        Processing...
      </span>
    {:else}
      Run Function Calling
    {/if}
  </Button.Root>
</div>
