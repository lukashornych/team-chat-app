<script>
import { io } from 'socket.io-client'

export default {
  async asyncData ({ redirect, route, $http }) {
    return {
      messages: await $http.$get(
        `/api/getAllMessages/${route.params.id}`,
        {
          hooks: {
            afterResponse: [
              (req, opt, res) => {
                if (res.statusCode === 401) {
                  redirect({ name: 'auth-login' })
                }
              }
            ]
          }
        }
      )
    }
  },

  data () {
    return {
      socket: io(process.env.WS_URL),
      messages: [],
      selectedThreadId: null,
      selectedThreadMessages: [],
      showThreadDialog: false
    }
  },

  beforeMount () {
    this.socket.on('newMessage', (newMessage) => {
      this.messages.unshift(newMessage)

      if ((this.selectedThreadId != null) && (newMessage.threadId === this.selectedThreadId)) {
        this.selectedThreadMessages.unshift(newMessage)
      }
    })
  },

  methods: {
    async showThread (message) {
      this.selectedThreadId = message.threadId
      this.selectedThreadMessages = await this.$http.$get(
        `/api/getAllMessages/${this.selectedThreadId}?thread=true`,
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

      this.showThreadDialog = true
    }
  }
}
</script>

<template>
  <div class="channel-container">
    <CreateMessageForm
      :socket="socket"
      :channel-id="$route.params.id"
    />

    <VList>
      <VListItem
        v-for="message in messages"
        :key="message.id"
        @click="showThread(message)"
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

    <ThreadDialog
      v-if="showThreadDialog"
      :socket="socket"
      :thread-id="selectedThreadId"
      :messages="selectedThreadMessages"
      @input="showThreadDialog = false"
    />
  </div>
</template>

<style scoped lang="scss">
.message-content {
  // todo: overflow
  //overflow: auto;
}
</style>
