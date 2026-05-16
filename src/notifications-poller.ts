import store from "./store";

export async function startNotificationsPolling() {
  await store.dispatch("notifications/requestNotificationPermission");

  // Сразу проверяем обновления (без уведомлений, если разрешение ещё не дано)
  store.dispatch("notifications/checkForUpdates");

  const interval = setInterval(() => {
    store.dispatch("notifications/checkForUpdates");
  }, 60 * 1000); // Проверка каждые 60 секунд

  // Очистка интервала при закрытии вкладки
  window.addEventListener("beforeunload", () => clearInterval(interval));
}
