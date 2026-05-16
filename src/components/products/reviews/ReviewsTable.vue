<template>
  <div class="border rounded">
    <Table>
      <TableHeader class="bg-gray-50">
        <TableRow>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Товар
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Статус
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Автор
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Рейтинг
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Отзыв
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Дата создания
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Дата публикации<br>
            <span class="text-xs font-normal">(только для опубликованных)</span>
          </TableHead>
          <TableHead class="px-3 py-2 font-medium text-gray-600 text-xs whitespace-nowrap">
            Действия
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="reviews.length">
          <TableRow
              v-for="review in reviews"
              :key="review.id"
              class="hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
          >
            <!-- Товар -->
            <TableCell class="px-3 py-3 whitespace-nowrap text-xs ">
              {{ review.reviewable?.name || 'Не указан' }}
            </TableCell>

            <!-- Статус -->
            <TableCell class="px-3 py-3 whitespace-nowrap">
              <Badge :variant="getStatusVariant(review.status)">
                {{ getStatusText(review.status) }}
              </Badge>
            </TableCell>

            <!-- Автор -->
            <TableCell class="px-3 py-3 whitespace-nowrap text-xs">
              <div class="">{{ review.client?.name || 'Аноним' }}</div>
              <div class=" text-xs">{{ review.client?.email || 'Нет email' }}</div>
            </TableCell>

            <!-- Рейтинг -->
            <TableCell class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center">
                <StarIcon class="h-4 w-4 text-yellow-400 fill-yellow-400"/>
                <span class="ml-1 text-xs">{{ review.rating }}/5</span>
              </div>
              <!-- Display attribute ratings if they exist -->
              <div v-if="review.attributes.length" class="text-xs  mt-1">
                <div v-for="attr in review.attributes" :key="attr.id">
                  {{ attr.name }}: {{ attr.rating }}/5
                </div>
              </div>
            </TableCell>

            <!-- Отзыв -->
            <TableCell class="px-3 py-3 text-xs">
              <div class="min-w-[200px]  text-xs">{{ review.content }}</div>
              <!-- Display images if they exist -->
              <div v-if="review.images.length" class="mt-2 flex gap-2">
                <img
                    v-for="(image, index) in review.images"
                    :key="index"
                    :src="image"
                    class="h-10 w-10 object-cover rounded"
                    @click="openImage(image)"
                >
              </div>
            </TableCell>

            <!-- Дата создания -->
            <TableCell class="px-3 py-3 whitespace-nowrap text-xs ">
              {{ formatDateToRussian(review.created_at!) }}
            </TableCell>

            <!-- Дата публикации -->
            <TableCell class="px-3 py-3 whitespace-nowrap text-xs ">
              {{ review.published_at ? formatDateToRussian(review.published_at) : '-' }}
            </TableCell>

            <!-- Actions -->
            <TableCell class="px-3 py-3 whitespace-nowrap text-xs">
              <div class="flex items-center gap-2">
                <!-- Publish/Unpublish -->
                <Button
                    v-if="!review.is_published"
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    @click="publishReview(review.id!)"
                    title="Опубликовать"
                >
                  <CheckIcon class="h-4 w-4" />
                </Button>
                <Button
                    v-else
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
                    @click="unpublishReview(review.id!)"
                    title="Снять с публикации"
                >
                  <XIcon class="h-4 w-4" />
                </Button>

                <!-- Delete -->
                <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    @click="confirmDelete(review.id!)"
                    title="Удалить"
                >
                  <Trash2Icon class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </template>

        <TableRow v-else>
          <TableCell
              :colspan="8"
              class="h-20 text-center  py-3"
          >
            Нет отзывов
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import {StarIcon, CheckIcon, XIcon, Trash2Icon} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Button} from '@/components/ui/button'
import {Review} from "@/models/Review";
import axios from "axios";
import {toast} from "vue-sonner";
import {useDateFormat} from "@/composables/useDateFormat";

type ReviewStatus = 'new' | 'published' | 'pending' | 'draft' | 'imported' | 'rejected'

const props = defineProps<{
  reviews: Review[]
}>()


console.log(props.reviews)

const emit = defineEmits(['refresh'])

const {formatDateToRussian} = useDateFormat()

const getStatusText = (status: ReviewStatus): string => {
  const statusMap: Record<ReviewStatus, string> = {
    'new': 'Новый',
    'published': 'Опубликован',
    'pending': 'На рассмотрении',
    'draft': 'Черновик',
    'imported': 'Импортирован',
    'rejected': 'Отклонён'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: ReviewStatus) => {
  switch (status) {
    case 'published':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'draft':
      return 'outline'
    case 'imported':
      return 'success'
    case 'rejected':
      return 'destructive'
    default: // 'new'
      return 'info'
  }
}

const openImage = (imageUrl: string) => {
  window.open(imageUrl, '_blank')
}

const publishReview = async (reviewId: number) => {
  try {
    await axios.post(`/reviews/${reviewId}/publish`)
    toast.success('Отзыв опубликован')
    emit('refresh')
  } catch (error) {
    handleError(error, 'Ошибка при публикации отзыва')
  }
}

const unpublishReview = async (reviewId: number) => {
  try {
    await axios.post(`/reviews/${reviewId}/unpublish`)
    toast.success('Отзыв снят с публикации')
    emit('refresh')
  } catch (error) {
    handleError(error, 'Ошибка при снятии с публикации')
  }
}

const confirmDelete = (reviewId: number) => {
  if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
    deleteReview(reviewId)
  }
}

const deleteReview = async (reviewId: number) => {
  try {
    await axios.delete(`/reviews/${reviewId}`)
    toast.success('Отзыв удалён')
    emit('refresh')
  } catch (error) {
    handleError(error, 'Ошибка при удалении отзыва')
  }
}

const handleError = (error: unknown, defaultMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    toast.error(error.response.data?.message || defaultMessage)
  } else {
    toast.error(defaultMessage)
  }
}
</script>