<template>
  <div class="py-2 px-3">
    <Tabs v-model="currentTab">
      <TabsList>
        <TabsTrigger value="activated">
          Активные
        </TabsTrigger>
        <TabsTrigger value="deleted">
          Удаленные
        </TabsTrigger>
      </TabsList>

      <TabsContent value="activated">
        <PermissionGuard :permission="hasPermission(PermissionsData.USERS_DELETE)">
          <UsersList/>
        </PermissionGuard>
      </TabsContent>

      <TabsContent value="deleted">
        <UsersDeleted/>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import UsersList from "@/components/users/Index.vue";
import UsersDeleted from "@/components/users/Deleted.vue";
import {User} from "@/models/user/User";
import {useStore} from "vuex";
import {PermissionsData} from "@/constants/PermissionsData";
import PermissionGuard from "@/components/PermissionGuard.vue";
import usePermission from "@/composables/usePermission";

const currentTab = ref("activated");
const store = useStore();
const user = computed(() => User.fromJSON(store.getters['auth/user']));

const {hasPermission} = usePermission()



</script>
