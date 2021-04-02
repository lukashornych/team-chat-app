<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      account: {
        name: this.$store.state.account.loggedInUser.name,
        username: this.$store.state.account.loggedInUser.username,
        newPassword: ''
      },
      registrationInvitations: [],
      users: [],
      editingUser: null
    }
  },

  validations: {
    account: {
      name: {
        required,
        minLength: minLength(5)
      },
      username: {
        required,
        minLength: minLength(5)
      },
      newPassword: {
        minLength: minLength(12)
      }
    }
  },

  fetch () {
    // todo server
    if (this.$store.getters) {
      this.registrationInvitations = [
        {
          code: 'aa',
          accepted: false
        },
        {
          code: 'bb',
          accepted: true
        },
        {
          code: 'cc',
          accepted: false
        }
      ]

      this.users = [
        {
          id: 1,
          username: 'lukas',
          name: 'Lukáš',
          role: 'ADMINISTRATOR'
        },
        {
          id: 2,
          username: 'tomas',
          name: 'Tomáš',
          role: 'MODERATOR'
        }
      ]
    }
  },

  methods: {
    saveAccount () {
      this.$v.account.$touch()

      if (!this.$v.account.$invalid) {
        // todo server
      }
    },

    generateRegistrationCode () {
      // todo: server
      this.$fetch()
    },

    selectEditingUser (user) {
      if (!this.editingUser) {
        this.editingUser = user
        return
      }
      if (this.editingUser.id === user.id) {
        this.editingUser = null
        return
      }
      this.editingUser = user
    },

    saveEditingUserRole () {
      // todo: server
      this.$fetch()
    }
  }
}
</script>

<template>
  <div class="settings-container">
    <form
      novalidate
      @submit.prevent="saveAccount"
    >
      <h2 class="mb-3">Úprava profilu</h2>

      <VTextField
        v-model="account.name"
        label="Jméno"
        outlined
      />
      <VTextField
        v-model="account.username"
        label="Uživatelské jméno"
        outlined
      />
      <VTextField
        v-model="account.newPassword"
        label="Nové heslo"
        outlined
        type="password"
      />

      <!-- todo: photo -->

      <VBtn type="submit">
        Uložit
      </VBtn>
    </form>

    <div class="pa-4" />

    <form
      v-if="$store.getters['account/isAdministrator']"
      novalidate
      @submit.prevent="generateRegistrationCode"
    >
      <h2 class="mb-3">Pozvánky do aplikace</h2>

      <VList>
        <VListItem
          v-for="registrationInvitation in registrationInvitations"
          :key="registrationInvitation.code"
          disabled
        >
          <VListItemTitle>
            {{ registrationInvitation.code }}
          </VListItemTitle>

          <VListItemActionText>
            {{ registrationInvitation.accepted ? 'Již použit' : 'Volný' }}
          </VListItemActionText>
        </VListItem>
      </VList>

      <VBtn type="submit">
        Vygenerovat kód
      </VBtn>
    </form>

    <div class="pa-4" />

    <form
      v-if="$store.getters['account/isAdministrator']"
      novalidate
      @submit.stop
    >
      <h2 class="mb-3">Změna rolí uživatelů</h2>

      <VList>
        <VListItem
          v-for="user in users"
          :key="user.id"
          @click="selectEditingUser(user)"
        >
          <VListItemTitle>
            {{ user.name }}
          </VListItemTitle>

          <VListItemActionText>
            {{ user.role }}
          </VListItemActionText>
        </VListItem>
      </VList>

      <div
        v-if="editingUser"
        class="mt-2"
      >
        <span>Vybraný uživatel: {{ editingUser.name }}</span>

        <div class="my-2" />

        <VSelect
          v-model="editingUser.role"
          :items="[{ text: 'ADMINISTRATOR', value: 'ADMINISTRATOR' }, { text: 'MODERATOR', value: 'MODERATOR' }, { text: 'USER', value: 'USER' }]"
          label="Role vybraného uživatele"
          outlined
          @input="saveEditingUserRole"
        />
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.settings-container {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
