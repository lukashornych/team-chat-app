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
      showThreadDialog: false
    }
  },

  beforeMount () {
    this.socket.on('newMessage', (newMessage) => {
      this.messages.unshift(newMessage)
    })
  },

  methods: {
    showThread (message) {
      this.selectedThreadId = message.threadId
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
          <VImg src="https://cdn.vuetifyjs.com/images/john.png" />
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
      @messagesUpdated="$fetch"
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
