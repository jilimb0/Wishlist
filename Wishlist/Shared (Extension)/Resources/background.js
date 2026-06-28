browser.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  console.log("Received request: ", request)

  if (request.greeting === "hello") return Promise.resolve({ farewell: "goodbye" })
})
