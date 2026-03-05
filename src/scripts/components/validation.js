const showInputError = (formElement, inputElement, errorMessage, settings) => {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.classList.remove(settings.errorClass);
    errorElement.textContent = '';
};

const checkInputValidity = (formElement, inputElement, settings) => {
    if (inputElement.dataset.errorMessage) {
        const pattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
        if (!pattern.test(inputElement.value)) {
            showInputError(formElement, inputElement, inputElement.dataset.errorMessage, settings);
            return;
        }
    }

    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        hideInputError(formElement, inputElement, settings);
    }
};

const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (buttonElement, settings) => {
    buttonElement.disabled = true;
    buttonElement.classList.add(settings.inactiveButtonClass);
};

const enableSubmitButton = (buttonElement, settings) => {
    buttonElement.disabled = false;
    buttonElement.classList.remove(settings.inactiveButtonClass);
};

const toggleButtonState = (inputList, buttonElement, settings) => {
    if (hasInvalidInput(inputList)) {
        disableSubmitButton(buttonElement, settings);
    } else {
        enableSubmitButton(buttonElement, settings);
    }
};

const setEventListeners = (formElement, settings) => {

    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach((inputElement) => {
        inputElement.addEventListener('input', () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
};

export const clearValidation = (formElement, settings) => {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    inputList.forEach(inputElement => {
        hideInputError(formElement, inputElement, settings);
    });

    disableSubmitButton(buttonElement, settings);
};

export const enableValidation = (settings) => {
    const forms = Array.from(document.querySelectorAll(settings.formSelector));
    forms.forEach(formElement => {
        formElement.addEventListener('submit', (evt) => evt.preventDefault());
        setEventListeners(formElement, settings);
    });
};