import { useQuery, useQueryClient, useMutation } from "react-query";

const SERVER_ADDRESS = 'http://localhost:3000';

export const useNotes = (userId) => {
    const queryClient = useQueryClient();
    const {data, isLoading, isError} = useQuery(['notes'],async ()=>{
        const response = await fetch(`${SERVER_ADDRESS}/list-notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });

        const data = await response.json();
        return data;
    });

    const deleteNote = useMutation((id) => fetch(`${SERVER_ADDRESS}/delete-note`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    }),{
      onSuccess: () => queryClient.invalidateQueries(['notes'])
    });

    const addNote = useMutation(({title, content, type}) => {
      if(type==="image")
      {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('userId', userId);
        formData.append('file', content);
            return fetch(`${SERVER_ADDRESS}/add-image-note`, {
              method: 'POST',
              body: formData,
            });
      }
      else
      {
        return fetch(`${SERVER_ADDRESS}/add-note`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, text: content, userId }),
      })
    }},{
      onSuccess: () => queryClient.invalidateQueries(['notes'])
    });

    return {data, addNote, deleteNote, isLoading, isError};
};

export const usePicture = (name) => {
  const {data, isLoading, isError} = useQuery(['picture', name],async ()=>{
    const response = await fetch(`${SERVER_ADDRESS}/get-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
  });

    const data = await response.blob();
    return data;
});

return {data, isLoading, isError};
}
