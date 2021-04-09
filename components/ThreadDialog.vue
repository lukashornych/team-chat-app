<script>
export default {
  name: 'ThreadDialog',

  props: {
    socket: {
      type: Object,
      required: true
    },
    threadId: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      messages: []
    }
  },

  async fetch () {
    this.messages = await this.$http.$get(
      `/api/getAllMessages/${this.$route.params.id}?thread=true`,
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
  },

  beforeMount () {
    this.socket.on('newMessage', function (newMessage) {
      if (newMessage.threadId === this.threadId) {
        this.messages.unshift(newMessage)
      }
    })
  }
}
</script>

<template>
  <VDialog
    :value="true"
    max-width="600"
    @input="$emit('input', $event)"
  >
    <VCard>
      <VCardTitle class="headline">
        Vlákno
      </VCardTitle>

      <CreateMessageForm
        :socket="socket"
        :thread-id="threadId"
      />

      <VList>
        <VListItem
          v-for="message in messages"
          :key="message.id"
        >
          <VListItemAvatar>
            <VImg :src="`/api/getAccountPhoto/${message.creator.id}`" />
          </VListItemAvatar>

          <VListItemContent>
            <VListItemTitle>
              {{ message.creator.name }}
            </VListItemTitle>

            <VListItemSubtitle class="message-content">
              {{ message.content }}
            </VListItemSubtitle>
          </VListItemContent>
        </VListItem>
      </VList>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="darken-1"
          text
          @click="$emit('input', false)"
        >
          Zavřít
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

</style>
