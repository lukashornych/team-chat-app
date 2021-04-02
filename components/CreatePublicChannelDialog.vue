<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'CreatePublicChannelDialog',

  data () {
    return {
      showCreatePublicChannelDialog: false,
      name: '',
      description: ''
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
      this.showCreatePublicChannelDialog = false
      this.name = ''
      this.description = ''
      this.$v.$reset()
    },

    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        console.log('sending requests') // todo: server

        this.close()
      }
    }
  },

  emits: ['input']
}
</script>

<template>
  <VDialog
    v-model="showCreatePublicChannelDialog"
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
        Založit kanál
      </VBtn>
    </template>
    <VCard>
      <VCardTitle>
        <span class="headline">
          Založit kanál
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
          @click="close"
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
