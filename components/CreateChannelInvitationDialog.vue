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

  async fetch () {
    const users = await this.$http.$get(
      `/api/getChannelsInvitableAccounts/${this.channel.id}`,
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

    this.users = users.map(u => ({
      text: u.name,
      value: u.id
    }))
  },

  methods: {
    submit () {
      this.$http.$post(
        '/api/createChannelInvitation',
        {
          channelId: this.channel.id,
          userIds: this.selectedUsers.map(u => u.value)
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
