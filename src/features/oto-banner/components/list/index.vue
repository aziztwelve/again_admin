<template>
  <div class="space-y-2">

    <div class="md:flex justify-between items-center max-md:space-y-2">

      <BackButton title="Назад"/>
      <OtoBannerAdd
          @create-emit="handleCreate"
      />
    </div>

    <OtoBannerSearch
        :filter="searchParams"
        @search="handleSearch"
    />
    <OtoBannerTable
        :loading="sending"
        :banners="banners"
        :pagination="searchParams"
        @delete-emit="handleDelete"
        @update-emit="handleUpdate"
        @duplicate-emit="handleDuplicate"
        @toggle-status-emit="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import {useOtoBanners} from "@/features/oto-banner/composables/useOtoBanners"
import {
  formDataToUpdateRequest,
  OtoBanner,
  OtoBannerSearchParams,
  otoBannerToFormData,
  createOtoBannerSearchParams,
} from "@/features/oto-banner/types"
import {onMounted, ref} from "vue"
import OtoBannerTable from "./OtoBannerTable.vue"
import OtoBannerAdd from "../add/OtoBannerAdd.vue"
import OtoBannerSearch from "./OtoBannerSearch.vue"
import BackButton from "@/components/BackButton.vue"

const banners = ref<OtoBanner[]>([])

const searchParams = ref<OtoBannerSearchParams>(createOtoBannerSearchParams())

const {
  getOtoBanners,
  deleteOtoBanner,
  updateOtoBanner,
  duplicateOtoBanner,
  toggleOtoBannerStatus,
  sending
} = useOtoBanners()

onMounted(async () => {
  await getData()
})

async function getData() {
  getOtoBanners(searchParams.value)
      .then(res => {
        banners.value = res?.data ?? []
        searchParams.value.total = res?.meta.total ?? 0
      })
}

const handleDelete = async (banner: OtoBanner) => {
  if (!banner.id) return
  try {
    await deleteOtoBanner(banner.id)
    banners.value = banners.value?.filter(b => b.id !== banner.id)
  } catch (e) {
    console.log(e)
  }
}

const handleUpdate = async (banner: OtoBanner) => {
  if (!banner.id) return

  const bannerFormData = otoBannerToFormData(banner)
  const formData = formDataToUpdateRequest(bannerFormData)

  try {
    const updatedBanner = await updateOtoBanner(banner.id, formData)

    banners.value = banners.value
        ?.map((b: OtoBanner) => b.id === updatedBanner?.id ? updatedBanner : b)

  } catch (e) {
    console.log(e)
  }
}

const handleDuplicate = async (banner: OtoBanner) => {
  if (!banner.id) return
  try {
    const newBanner = await duplicateOtoBanner(banner.id)
    if (newBanner) {
      banners.value = [newBanner, ...banners.value]
    }
  } catch (e) {
    console.log(e)
  }
}

const handleToggleStatus = async (banner: OtoBanner) => {
  if (!banner.id) return
  try {
    const updatedBanner = await toggleOtoBannerStatus(banner.id)
    banners.value = banners.value
        ?.map((b: OtoBanner) => b.id === updatedBanner?.id ? updatedBanner : b)
  } catch (e) {
    console.log(e)
  }
}

const handleCreate = (banner: OtoBanner) => {
  banners.value = [banner, ...(banners.value ?? [])]
}

const handleSearch = () => {
  searchParams.value.page = 1
  getData()
}

</script>

<style scoped>

</style>