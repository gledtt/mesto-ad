const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "f02081dc-18e9-479a-b48a-2dd090cbfdef",
    "Content-Type": "application/json",
  },
};

const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
}; 

export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(getResponseData); 
};

export const getCardList = (res) => {
    return fetch(`${config.baseUrl}/cards`, {
        headers: config.headers,
    }).then(getResponseData)
}

export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name,
      about
    }),
  }).then(getResponseData);
};

export const setUserAvatar = ({avatar}) => {
    return fetch(`${config.baseUrl}/users/me/avatar`, {
        method: "PATCH",
        headers: config.headers,
        body: JSON.stringify({
            avatar
        }),
    }).then(getResponseData);
};

export const createCard = ({ name, link}) => {
    return fetch(`${config.baseUrl}/cards`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            name,
            link
        })
    })
};

export const deleteCardRequest = (cardId) => {
    return fetch((`${config.baseUrl}/cards/${cardId}`), {
        method: "DELETE",
        headers: config.headers
    }).then(getResponseData)
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return fetch((`${config.baseUrl}/cards/likes/${cardId}`), {
    method: isLiked? "DELETE" : "PUT",
    headers: config.headers
  }).then(getResponseData)
};