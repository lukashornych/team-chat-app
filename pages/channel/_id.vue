<script>
import { io } from 'socket.io-client'

export default {
  asyncData ({ redirect, $http }) {
    return {
      messages: $http.$get(
        '/api/getAllMessages',
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
      socket: null,
      messages: [],
      selectedThreadId: null,
      showThreadDialog: false
    }
  },

  mounted () {
    this.socket = io(`ws://${window.location.hostname}/api/messages`)
    this.socket.on('newMessage', function (newMessage) {
      this.messages.push(newMessage)
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
