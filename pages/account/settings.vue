<script>
import { required, minLength } from 'vuelidate/lib/validators'
import base64js from 'base64-js'

export default {
  data () {
    return {
      account: {
        name: this.$store.state.account.loggedInUser.name,
        username: this.$store.state.account.loggedInUser.username,
        newPassword: '',
        newPhoto: null
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
        minLength: minLength(8)
      }
    }
  },

  async fetch () {
    if (this.$store.getters['account/isAdministrator']) {
      this.registrationInvitations = await this.$http.$get(
        '/api/getAllRegistrationInvitations',
        {
          hooks: {
            afterResponse: [
              (req, opt, res) => {
                if (res.statusCode === 401) {
                  this.$router.push({ name: 'auth-login' })
                }
              }
            ]
          }
        }
      )

      this.users = await this.$http.$get(
        '/api/getAllAccounts',
        {
          hooks: {
            afterResponse: [
              (req, opt, res) => {
                if (res.statusCode === 401) {
                  this.$router.push({ name: 'auth-login' })
                }
              }
            ]
          }
        }
      )
    }
  },

  methods: {
    updatePhoto (photoFile) {
      this.account.newPhoto = photoFile
    },

    async saveAccount () {
      this.$v.account.$touch()

      if (!this.$v.account.$invalid) {
        let serializedNewPhoto = null
        if (this.account.newPhoto != null) {
          const photoBinaryData = await this.account.newPhoto.arrayBuffer()
          serializedNewPhoto = base64js.fromByteArray(new Uint8Array(photoBinaryData))
        }

        await this.$http.put(
          '/api/updateAccount',
          {
            userId: this.account.id,
            name: this.account.name,
            username: this.account.username,
            newPassword: this.account.newPassword,
            newPhoto: serializedNewPhoto
          },
          {
            hooks: {
              afterResponse: [
                (req, opt, res) => {
                  if (res.statusCode === 401) {
                    this.$router.push({ name: 'auth-login' })
                  }
                }
              ]
            }
          }
        )

        this.$store.commit('account/update', { name: this.account.name, username: this.account.username })
      }
    },

    async generateRegistrationCode () {
      await this.$http.$post(
        '/api/generateRegistrationInvitation',
        {
          hooks: {
            afterResponse: [
              (req, opt, res) => {
                if (res.statusCode === 401) {
                  this.$router.push({ name: 'auth-login' })
                }
              }
            ]
          }
        }
      )

      await this.$fetch()
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

    async saveEditingUserRole () {
      await this.$http.$put(
        '/api/updateAccount.js',
        {
          userId: this.editingUser.id,
          role: this.editingUser.role
        },
        {
          hooks: {
            afterResponse: [
              (req, opt, res) => {
                if (res.statusCode === 401) {
                  this.$router.push({ name: 'auth-login' })
                }
              }
            ]
          }
        }
      )

      await this.$fetch()
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
      <h2 class="mb-3">
        Úprava profilu
      </h2>

      <VTextField
        v-model="account.name"
        label="Jméno"
        outlined
      />
      <p
        v-if="$v.account.name.$error"
      >
        Jméno je povinné
      </p>
      <VTextField
        v-model="account.username"
        label="Uživatelské jméno"
        outlined
      />
      <p
        v-if="$v.account.username.$error"
      >
        Uživatelské jméno je povinné
      </p>
      <VTextField
        v-model="account.newPassword"
        label="Nové heslo"
        outlined
        type="password"
      />
      <p
        v-if="$v.account.newPassword.$error"
      >
        Nové heslo musí mít alespoň 8 znaků
      </p>

      <VFileInput
        label="Nová fotografie"
        truncate-length="15"
        outlined
        prepend-icon="mdi-camera"
        accept="image/png, image/jpeg, image/bmp"
        @change="updatePhoto($event)"
      />

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
      <h2 class="mb-3">
        Pozvánky do aplikace
      </h2>

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
      <h2 class="mb-3">
        Změna rolí uživatelů
      </h2>

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
          :items="[{ text: 'ADMIN', value: 'ADMIN' }, { text: 'MODERATOR', value: 'MODERATOR' }, { text: 'USER', value: 'USER' }]"
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
