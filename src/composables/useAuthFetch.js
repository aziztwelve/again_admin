import {useAsyncData} from "#app";

export const useAuthFetch = async (url, options = {}) => {
  const {getSession} = useAuth()
  const sess = await getSession()

  const headers = {
    ...(options.headers || {}),
    ...(sess.accessToken ? {Authorization: `Bearer ${sess.accessToken}`} : {})
  }


  return useAsyncData(() => {
    return $fetch(url, {
      ...options,
      headers
    })
  });
}
