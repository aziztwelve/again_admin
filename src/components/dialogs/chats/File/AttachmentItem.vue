<template>
  <div class="inline-block">
    <!-- Image attachment -->
    <div
      v-if="attachment.type === 'image'"
      class="relative group cursor-pointer"
      @click="openImage"
    >
      <img
        :src="attachment.url"
        :alt="attachment.file_name"
        class="max-w-[180px] max-h-[180px] rounded-md object-cover border"
        loading="lazy"
      />

      <!-- Overlay on hover -->
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-md flex items-center justify-center"
      >
        <ZoomIn
          class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <!-- File size badge -->
      <div
        v-if="attachment.file_size"
        class="absolute bottom-1 right-1 bg-black/60 text-white text-[0.6rem] px-1.5 py-0.5 rounded"
      >
        {{ formatFileSize(attachment.file_size) }}
      </div>
    </div>

    <!-- Video attachment -->
    <div v-else-if="attachment.type === 'video'" class="relative group">
      <video
        :src="attachment.url"
        class="max-w-[280px] max-h-[200px] rounded-md border"
        controls
        preload="metadata"
      >
        Ваш браузер не поддерживает видео.
      </video>

      <!-- File size badge -->
      <div
        v-if="attachment.file_size"
        class="absolute bottom-1 right-1 bg-black/60 text-white text-[0.6rem] px-1.5 py-0.5 rounded"
      >
        {{ formatFileSize(attachment.file_size) }}
      </div>

      <!-- Download button -->
      <Button
        variant="secondary"
        size="icon"
        class="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="downloadFile"
      >
        <Download class="w-3.5 h-3.5" />
      </Button>
    </div>

    <!-- Audio attachment -->
    <div
      v-else-if="attachment.type === 'audio'"
      class="flex items-center gap-2 bg-muted rounded-md p-2 min-w-[220px] max-w-[280px]"
    >
      <!-- Play button -->
      <Button
        variant="secondary"
        size="icon"
        @click="toggleAudio"
        class="flex-shrink-0 h-8 w-8 rounded-full"
      >
        <Play v-if="!isPlaying" class="w-4 h-4" />
        <Pause v-else class="w-4 h-4" />
      </Button>

      <!-- Audio info -->
      <div class="flex-1 min-w-0">
        <div class="text-xs font-medium truncate">
          {{ attachment.file_name }}
        </div>
        <div
          class="text-[0.6rem] text-muted-foreground flex items-center gap-1"
        >
          <span v-if="attachment.file_size">
            {{ formatFileSize(attachment.file_size) }}
          </span>
          <span v-if="duration">• {{ formatDuration(duration) }}</span>
        </div>
      </div>

      <!-- Download button -->
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 flex-shrink-0"
        @click="downloadFile"
      >
        <Download class="w-3.5 h-3.5" />
      </Button>

      <!-- Hidden audio element -->
      <audio
        ref="audioElement"
        :src="attachment.url"
        @ended="handleAudioEnded"
        @loadedmetadata="handleAudioLoaded"
      />
    </div>

    <!-- File attachment -->
    <div
      v-else
      class="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-md p-2 cursor-pointer transition-colors min-w-[220px] max-w-[280px]"
      @click="downloadFile"
    >
      <!-- File icon -->
      <div
        class="flex-shrink-0 w-8 h-8 rounded bg-muted-foreground/10 flex items-center justify-center"
      >
        <FileText class="w-5 h-5 text-muted-foreground" />
      </div>

      <!-- File info -->
      <div class="flex-1 min-w-0">
        <div class="text-xs font-medium truncate">
          {{ attachment.file_name }}
        </div>
        <div class="text-[0.6rem] text-muted-foreground">
          {{
            attachment.file_size ? formatFileSize(attachment.file_size) : "Файл"
          }}
        </div>
      </div>

      <!-- Download icon -->
      <Download class="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, FileText, ZoomIn } from "lucide-vue-next";
import type { Attachment } from "@/types/conversation";
import { formatFileSize } from "@/types/conversation";

interface Props {
  attachment: Attachment;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  imageClick: [url: string];
}>();

// Audio player state
const audioElement = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const duration = ref<number>(0);

// Open image in new tab
const openImage = () => {
  window.open(props.attachment.url, "_blank");
};

// Toggle audio playback
const toggleAudio = () => {
  if (!audioElement.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  } else {
    audioElement.value.play();
    isPlaying.value = true;
  }
};

// Handle audio ended
const handleAudioEnded = () => {
  isPlaying.value = false;
};

// Handle audio loaded
const handleAudioLoaded = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration;
  }
};

// Download file
const downloadFile = async () => {
  try {
    // Используем fetch для получения файла как blob
    const response = await fetch(props.attachment.url);
    const blob = await response.blob();

    // Создаем временный URL для blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Создаем ссылку и кликаем
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = props.attachment.file_name;
    document.body.appendChild(link);
    link.click();

    // Очищаем
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Ошибка скачивания файла:", error);
    // Fallback на старый метод
    const link = document.createElement("a");
    link.href = props.attachment.url;
    link.download = props.attachment.file_name;
    link.click();
  }
};

// Format duration (seconds to MM:SS)
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
</script>

<style scoped>
/* Smooth transitions */
button {
  transition: all 0.2s ease;
}

/* Image hover effect */
img {
  transition: transform 0.2s ease;
}
</style>
