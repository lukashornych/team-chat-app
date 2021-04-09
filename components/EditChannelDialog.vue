<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'EditChannelDialog',

  props: {
    channel: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      name: this.channel.name,
      description: this.channel.description,
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
    async submit () {
      this.error = ''
      this.$v.$touch()

      if (!this.$v.$invalid) {
        try {
          await this.$http.$put(
            '/api/updateChannel',
            { id: this.channel.id, name: this.channel.name, description: this.channel.description },
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
        } catch (e) {
          this.error = 'Nastala neočekávaná chyba.'
          return
        }

        this.$emit('input', false)
      }
    }
  },

  emits: ['input']
}
</script>

<template>
  <VDialog
    value="true"
    persistent
    max-width="600px"
    @input="$emit('input', $event)"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">
          Upravit kanál/skupinu
        </span>
      </VCardTitle>
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
          </VRow>
        </VContainer>
        <small>*značí povinné pole</small>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="blue darken-1"
          text
          @click="$emit('input', false)"
        >
          Zrušit
        </VBtn>
        <VBtn
          color="blue darken-1"
          text
          @click="submit"
        >
          Uložit
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

</style>
