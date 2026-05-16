import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useColorsFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    const getColors = async () => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('colors')
            .then(res => {
                // console.log(res.data)
                return res.data.colors
            })

            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)


    }

    return {
        getColors,
        sending,
        progress,
    }
}
