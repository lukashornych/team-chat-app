<script>
export default {
  name: 'CreateChannelInvitationDialog',

  props: {
    channel: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      users: [],
      selectedUsers: []
    }
  },

  fetch () {
    // todo server
    this.users = [
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

  methods: {
    submit () {
      console.log('sending requests') // todo: server

      this.$emit('input', false)
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
          Pozvat uživatele do toho kanálu
        </span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="selectedUsers"
                :items="users"
                label="Vybraní uživatelé"
                outlined
                multiple
              />
            </VCol>
          </VRow>
        </VContainer>
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
          Pozvat
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

</style>
