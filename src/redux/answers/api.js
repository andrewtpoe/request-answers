export function getAnswer() {
  return fetch('https://yesno.wtf/api').then(response =>
    response.json().then(body => ({
      response: {
        headers: response.headers,
        body,
        status: response.status,
      },
    })),
  );
}
