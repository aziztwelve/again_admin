<template>
  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">VPN Amnezia</h1>
        <p class="text-muted-foreground">
          Настройки SOCKS5 proxy для исходящих запросов Telegram
        </p>
      </div>
      <Badge :variant="form.enabled ? 'default' : 'secondary'" class="w-fit">
        {{ form.enabled ? 'Включено' : 'Выключено' }}
      </Badge>
    </div>

    <Separator />

    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
            VPN
          </div>
          <div class="flex flex-1 items-center justify-between gap-4">
            <div>
              <CardTitle>Telegram через Amnezia</CardTitle>
              <CardDescription>
                Proxy применяется только к backend-запросам Telegram API
              </CardDescription>
            </div>
            <Switch v-model="form.enabled" />
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_140px]">
          <div class="space-y-2">
            <Label for="amnezia-host">Host</Label>
            <Input id="amnezia-host" v-model="form.host" placeholder="85.159.228.227" />
          </div>
          <div class="space-y-2">
            <Label for="amnezia-port">Port</Label>
            <Input id="amnezia-port" v-model.number="form.port" type="number" min="1" max="65535" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="amnezia-scheme">Scheme</Label>
            <select
              id="amnezia-scheme"
              v-model="form.scheme"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="socks5h">socks5h</option>
              <option value="socks5">socks5</option>
              <option value="http">http</option>
              <option value="https">https</option>
            </select>
          </div>
          <div class="space-y-2">
            <Label for="amnezia-username">Username</Label>
            <Input id="amnezia-username" v-model="form.username" placeholder="SOCKS5 user" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="amnezia-password">Password</Label>
          <Input
            id="amnezia-password"
            v-model="form.password"
            type="password"
            :placeholder="form.has_password ? 'Пароль сохранён' : 'SOCKS5 password'"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <Button :disabled="sending" @click="save">Сохранить</Button>
          <Button variant="outline" :disabled="sending || !canTest" @click="test">
            Проверить
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Статус</CardTitle>
        <CardDescription>Последняя проверка proxy и Telegram API</CardDescription>
      </CardHeader>
      <CardContent class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-md border p-4">
          <div class="text-sm text-muted-foreground">External IP</div>
          <div class="mt-1 font-medium">{{ lastCheck?.external_ip || 'Нет данных' }}</div>
        </div>
        <div class="rounded-md border p-4">
          <div class="text-sm text-muted-foreground">Telegram status</div>
          <div class="mt-1 font-medium">{{ lastCheck?.telegram_status || 'Нет данных' }}</div>
        </div>
        <div class="rounded-md border p-4">
          <div class="text-sm text-muted-foreground">Result</div>
          <div class="mt-1 font-medium" :class="lastCheck?.ok ? 'text-green-700' : 'text-red-700'">
            {{ lastCheck ? (lastCheck.ok ? 'OK' : 'Ошибка') : 'Нет данных' }}
          </div>
        </div>
        <div class="rounded-md border p-4">
          <div class="text-sm text-muted-foreground">Checked at</div>
          <div class="mt-1 font-medium">{{ lastCheck?.checked_at || 'Нет данных' }}</div>
        </div>
        <div class="rounded-md border p-4 md:col-span-2">
          <div class="text-sm text-muted-foreground">Message</div>
          <div class="mt-1 break-words font-medium">{{ lastCheck?.message || 'Нет данных' }}</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAmneziaVpn, type AmneziaVpnCheck } from '@/composables/useAmneziaVpn'

const { sending, getSettings, saveSettings, testConnection } = useAmneziaVpn()

const form = reactive({
  enabled: false,
  scheme: 'socks5h',
  host: '85.159.228.227',
  port: null as number | null,
  username: '',
  password: '',
  has_password: false,
})

const lastCheck = ref<AmneziaVpnCheck | null>(null)

const canTest = computed(() => Boolean(form.host && form.port))

const applySettings = (settings: any) => {
  form.enabled = Boolean(settings.enabled)
  form.scheme = settings.scheme || 'socks5h'
  form.host = settings.host || '85.159.228.227'
  form.port = settings.port || null
  form.username = settings.username || ''
  form.password = ''
  form.has_password = Boolean(settings.has_password)
  lastCheck.value = settings.last_check || null
}

onMounted(async () => {
  const settings = await getSettings()
  if (settings) applySettings(settings)
})

const save = async () => {
  const payload: any = {
    enabled: form.enabled,
    scheme: form.scheme,
    host: form.host,
    port: form.port,
    username: form.username,
  }

  if (form.password) {
    payload.password = form.password
  }

  const settings = await saveSettings(payload)
  if (settings) applySettings(settings)
}

const test = async () => {
  const result = await testConnection()
  if (result) lastCheck.value = result
}
</script>
