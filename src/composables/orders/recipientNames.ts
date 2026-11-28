/**
 * ФИО получателя для форм заказа.
 *
 * Если получатель в заказе уже указан, берём только его: подстановка из профиля клиента
 * меняла получателя при любом сохранении (в заказе появлялось отчество из профиля).
 * Профиль используется, только когда получателя в заказе ещё нет.
 */
export function recipientNames(address: any, client: any) {
  const current = address || {};
  if (current.recipient_first_name || current.recipient_last_name) {
    return {
      first_name: current.recipient_first_name || "",
      last_name: current.recipient_last_name || "",
      middle_name: current.recipient_middle_name || "",
    };
  }

  const profile = client?.profile || {};

  return {
    first_name: profile.first_name || client?.first_name || "",
    last_name: profile.last_name || client?.last_name || "",
    middle_name: current.recipient_middle_name || profile.middle_name || "",
  };
}
