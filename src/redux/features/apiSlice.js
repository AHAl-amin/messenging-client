


import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://backend.c-levels.com/", 
});

export const ApiSlice = createApi({
  reducerPath: "ApiSlice",
  baseQuery,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({






  
    b2cPlan: builder.query({
      query: (type = "b2c") => ({
        url: `api/plans/?type=${type}`,
      }),
    }),



    contact: builder.mutation({
      query: (data) => ({
        url: "api/contact/submit/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
    }),
    checkout: builder.mutation({
      query: (data) => ({
        url: "api/create-checkout-session/",
        method: "POST",

        body: data,
      }),
    }),




    sessionCreate: builder.mutation({
      query: (body) => ({
        url: 'api/chat/sessions/',
        method: 'POST',
        body,
      }),
    }),


    sendMessage: builder.mutation({
      query: ({ session_id, message }) => {
        console.log(session_id, message)
        return ({
          url: 'api/chat/sessions/send_message/',
          method: 'POST',
          body: { session_id, message },
        })
      },
    }),


    getChatHistory: builder.query({
      query: (session_id) => `api/chat/sessions/${session_id}/`,

    }),


    getQuickReplies: builder.query({
      query: (session_id) => `api/chat/sessions/${session_id}/quick_replies/`,

    }),







  })
});

export const { useContactMutation, useB2cPlanQuery, useCheckoutMutation, useSessionCreateMutation, useSendMessageMutation, useGetChatHistoryQuery, useGetQuickRepliesQuery } = ApiSlice;

export default ApiSlice;



