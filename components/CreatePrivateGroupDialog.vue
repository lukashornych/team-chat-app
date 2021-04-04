<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'CreatePrivateGroupDialog',

  fetch () {
    // todo server docuemnted
    this.selectableUsers = [
      {
        text: 'Lukáš',
        value: 1
      },
      {
        text: 'Tomáš',
        value: 2
      }
    ]
  },

  data () {
    return {
      selectableUsers: [],
      showCreatePrivateGroupDialog: false,
      name: '',
      description: '',
      users: [],
      error: ''
    }
  },

  validations: {
    name: {
      required,
      minLength: minLength(3)
    }
  },

  methods: {
    close () {
      this.showCreatePrivateGroupDialog = false
      this.name = ''
      this.description = ''
      this.users = []
      this.$v.$reset()
    },

    async submit () {
      this.error = ''
      this.$v.$touch()

      if (!this.$v.$invalid) {
        try {
          await this.$http.$post(
            '/api/newChannel',
            {
              type: 'PRIVATE_GROUP',
              name: this.name,
              description: this.description,
              userIds: this.users.map(u => u.id)
            },
            {
              hooks: {
                afterResponse: [
                  (req, opt, res) => {
                    if (res.statusCode === 403) {
                      this.$router.push({ name: 'auth-login' })
                    }
                  }
                ]
              }
            }
          )
        } catch (e) {
          this.error = 'Nastala neočekávaná chyba.'
          return
        }

        this.close()
      }
    }
  }
}
</script>

<template>
  <VDialog
    v-model="showCreatePrivateGroupDialog"
    persistent
    max-width="600px"
  >
    <template #activator="{ on, attrs }">
      <VBtn
        block
        raised
        elevation="0"
        v-bind="attrs"
        v-on="on"
      >
        Založit skupinu
      </VBtn>
    </template>
    <VCard>
      <VCardTitle>
        <span class="headline">
          Nová soukromá skupina
        </span>
      </VCardTitle>
      <v-alert
        v-if="error"
        color="red"
        type="error"
      >
        {{ error }}
      </v-alert>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="name"
                label="Název*"
                required
                outlined
              />
              <span v-if="$v.name.$error">toto pole je povinné</span>
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="description"
                label="Popis"
                outlined
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="users"
                :items="selectableUsers"
                label="Vybraní uživatelé"
                outlined
                multiple
              />
            </VCol>
          </VRow>
        </VContainer>
        <small>*značí povinné pole</small>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="blue darken-1"
          text
          @click="close"
        >
          Zrušit
        </VBtn>
        <VBtn
          color="blue darken-1"
          text
          @click="submit"
        >
          Vytvořit
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

</style>
