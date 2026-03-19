import { changeLikeCardStatus } from "./api.js";

export const likeCard = (likeButton, cardId, cardsLikes) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  
  likeButton.classList.toggle("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((data) => {
      cardsLikes.textContent = data.likes.length;
    })
    .catch(() => {
      likeButton.classList.toggle("card__like-button_is-active");
    });
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoIcon },
  userId) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardsLikes = cardElement.querySelector(".card__like-count");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  
  const likesArray = data.likes || [];

  const wasLike = likesArray.some(user => 
    user._id === userId
  );

  if (wasLike) {
    likeButton.classList.add("card__like-button_is-active");
  }

  cardsLikes.textContent = data.likes ? data.likes.length : 0;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, cardsLikes));
  }

  if (infoButton){
    infoButton.addEventListener("click", () => onInfoIcon(data._id))
  }


  if (userId && data.owner && userId === data.owner._id){
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
    }
  } else {
      deleteButton.style.display = 'none';
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};
