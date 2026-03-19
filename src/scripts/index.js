/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { createCardElement, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, createCard, deleteCardRequest } from "./components/api.js";
let currentUser = null;

//Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModal = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoModal.querySelector(".popup__title");
const cardInfoSubtitle = cardInfoModal.querySelector(".popup__text");
const cardInfoInfoList = cardInfoModal.querySelector(".popup__info");
const cardInfoUserList = cardInfoModal.querySelector(".popup__list");

// Попап подтверждения удаления
const removeCardPopup = document.querySelector('.popup_type_remove-card');
const removeCardForm = removeCardPopup.querySelector('.popup__form');

let cardToDelete = null;
let cardIdToDelete = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoDefinition = (label, value) => {
  const template = document.getElementById("popup-info-definition-template");
  const clone = template.content.cloneNode(true);
  clone.querySelector(".popup__info-term").textContent = label;
  clone.querySelector(".popup__info-description").textContent = value;
  return clone;
};

const createUsersLike = (user) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const clone = template.content.cloneNode(true);
  const listLikes = clone.querySelector(".popup__list-item");
  listLikes.textContent = user.name;
  return clone;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally (() => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    });
};

const handleInfoClick = (cardId) => {
  cardInfoInfoList.textContent = "";
  cardInfoUserList.textContent = "";

  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      cardInfoSubtitle.textContent = "Лайкнули:";
      cardInfoTitle.textContent = "Информация о карточке";

      cardInfoInfoList.append(
        createInfoDefinition("Описание:", cardData.name)
      );

      const creationDate = formatDate(new Date(cardData.createdAt));
      cardInfoInfoList.append(
        createInfoDefinition("Дата создания:", creationDate)
      );

      cardInfoInfoList.append(
        createInfoDefinition("Владелец карточки:", cardData.owner.name)
      );

      cardInfoInfoList.append(
        createInfoDefinition("Количество лайков:", cardData.likes.length)
      );

      cardData.likes.forEach((user) => {
        cardInfoUserList.append(createUsersLike(user));
      });

      openModalWindow(cardInfoModal);
    })
    .catch((err) => {
      console.error("Ошибка загрузки статистики:", err);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally (() => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  createCard({ 
    name: cardNameInput.value,
    link: cardLinkInput.value
   })
   .then((newCardData) => {
    console.log('Ответ сервера при создании карточки:', newCardData);
    placesWrap.prepend(
    createCardElement(newCardData,{
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: handleDeleteCardClick,
        onInfoIcon: handleInfoClick},
        currentUser._id
      )
    );
   })
    .finally(() => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    closeModalWindow(cardFormModalWindow);
  });
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = removeCardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Удаление...';
  submitButton.disabled = true;

  deleteCardRequest(cardIdToDelete)
    .then(() => {
      cardToDelete.remove();
      closeModalWindow(removeCardPopup);
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.error('Ошибка при удалении карточки:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleDeleteCardClick = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  openModalWindow(removeCardPopup);
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
.then(([cards, userData]) => {
  currentUser = userData;
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

  cards.forEach((cardData) => {
    placesWrap.append(
      createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture, 
        onLikeIcon: likeCard,
        onDeleteCard: handleDeleteCardClick,
        onInfoIcon: handleInfoClick},
        userData._id
      )
    )
  })
})
.catch((err) =>{
  console.log(err);
});