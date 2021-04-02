<script>
export default {
  name: 'CreateMessageForm',

  props: {
    socket: {
      type: Object,
      required: true
    },

    channelId: {
      type: Number,
      default: null
    },

    threadId: {
      type: Number,
      default: null
    }
  },

  data () {
    return {
      newMessage: ''
    }
  },

  methods: {
    submitNewMessage () {
      if (!this.newMessage) {
        return
      }

      // todo: send to server documented
      const newMessageRequest = {
        channelId: this.channelId,
        threadId: this.threadId,
        creatorId: this.$store.state.account.loggedInUser.id,
        content: this.newMessage
      }
      this.socket.emit('newMessage', newMessageRequest)

      this.newMessage = ''
    }
  }
}
</script>

<template>
  <form
    novalidate
    class="message-form pa-4 d-flex"
    @submit.prevent="submitNewMessage"
  >
    <VTextField
      v-model="newMessage"
      :placeholder="threadId != null ? 'Začněte psát zprávu...' : 'Začnete nové vlánko novou zprávou...'"
      outlined
    />

    <div class="pl-2">
      <VBtn
        raised
        elevation="0"
        :disabled="!newMessage"
        type="submit"
      >
        Odeslat
      </VBtn>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.message-form {
  width: 100%;
}
</style>
