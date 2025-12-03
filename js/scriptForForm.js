const checkName    = document.getElementById('name');
const emailInfo    = document.getElementById('email');
const commentInfo  = document.getElementById('comment');

const errorsInfo   = document.getElementById('errors');
const infoInfo     = document.getElementById('info');
const formErrors = document.getElementById('form_errors');
const contactForm = document.getElementById('contact-form');
const submitButton = document.getElementById('submit-button');

const allowedNameChar  = /^[A-Za-z ]$/;
const allowedEmailChar = /^[A-Za-z0-9@._%+\-]$/;
let form_errors = [];


function showError(message) {
    errorsInfo.textContent = message;
    if (message) {
        errorsInfo.classList.add('visible');
    } else {
        errorsInfo.classList.remove('visible');
    }
}

function addError(field, error) {
    form_errors.push({
        "field": field,
        "error": error
    });
    console.log(form_errors);
}

checkName.addEventListener('input', () => {
    const value = checkName.value;

    if (value !== "") {
        const lastChar = value[value.length - 1];

        if (!allowedNameChar.test(lastChar)) {
            checkName.value = value.slice(0, -1);

            checkName.classList.add('flash');
            showError('Illegal character. Only letters and a space are allowed.');

            setTimeout(() => {
                checkName.classList.remove('flash');
            }, 150);

            setTimeout(() => {
                errorsInfo.classList.remove('visible');
            }, 1500);

            addError('name', 'Illegal character. Only letters and a space are allowed.');
            return;
        }
    }

    if (checkName.validity.valueMissing) {
        checkName.setCustomValidity('Name is required.');
        showError('Name is required.');
    } else if (checkName.validity.tooShort) {
        checkName.setCustomValidity('Name must be at least 2 characters long.');
        showError('Name must be at least 2 characters long.');
    } else if (checkName.validity.patternMismatch) {
        checkName.setCustomValidity(
            'Name must be in the format "Firstname Lastname" (capitalize the first letter of each word).'
        );
        showError('Name must be in the format "Firstname Lastname" (capitalize the first letter of each word).');
    } else if (checkName.validity.tooLong) {
        checkName.setCustomValidity('Name must be less than 100 characters long.');
        showError('Name must be less than 100 characters long.');
    } else {
        checkName.setCustomValidity('');
        showError('');
    }

    checkName.reportValidity();

    if (checkName.validity.valid) {
        infoInfo.textContent = 'Name is valid!';
    } else {
        infoInfo.textContent = '';
    }

});

emailInfo.addEventListener('input', () => {
    const value = emailInfo.value;

    if (value !== "") {
        const lastChar = value[value.length - 1];

        if (!allowedEmailChar.test(lastChar)) {
            emailInfo.value = value.slice(0, -1);

            emailInfo.classList.add('flash');
            showError('Illegal character. Only email-safe characters are allowed.');

            setTimeout(() => {
                emailInfo.classList.remove('flash');
            }, 150);

            setTimeout(() => {
                errorsInfo.classList.remove('visible');
            }, 1500);
            addError('email', 'Illegal character. Only email-safe characters are allowed.');
            return;
        }
    }

    if (emailInfo.validity.valueMissing) {
        emailInfo.setCustomValidity('Email is required.');
        showError('Email is required.');
    } else if (emailInfo.validity.tooShort) {
        emailInfo.setCustomValidity('Email must be at least 5 characters long.');
        showError('Email must be at least 5 characters long.');
    } else if (emailInfo.validity.typeMismatch) {
        emailInfo.setCustomValidity('Email must be in the format "example@example.com".');
        showError('Email must be in the format "example@example.com".');
    } else {
        emailInfo.setCustomValidity('');
        showError('');
    }

    emailInfo.reportValidity();

    if (emailInfo.validity.valid) {
        infoInfo.textContent = 'Email is valid!';
    } else {
        infoInfo.textContent = '';
    }

});
const commentCounter = document.getElementById('comment-counter');

const maxCommentLength = commentInfo.maxLength;

commentInfo.addEventListener('input', () => {
    const length    = commentInfo.value.length;
    const remaining = maxCommentLength - length;

    const orangeWarning = maxCommentLength / 2;
    const redDanger     = maxCommentLength / 4;

    if (length == 0){
        commentCounter.textContent = ' '
    }
    else{
        commentCounter.textContent = `${remaining} characters remaining`;
    }


    commentCounter.classList.remove('warning', 'danger');

    if (remaining <= redDanger && remaining >= 0) {
        commentCounter.classList.add('danger');
    } else if (remaining <= orangeWarning) {
        commentCounter.classList.add('warning');
    }

    if (remaining < 0) {
        commentInfo.setCustomValidity('You have exceeded the maximum comment length.');
        showError('You have exceeded the maximum comment length.');
        addError('comment', 'You have exceeded the maximum comment length.');
    } else if (commentInfo.validity.tooShort) {
        commentInfo.setCustomValidity('Comment must be at least 10 characters long.');
        showError('Comment must be at least 10 characters long.');
    } else {
        commentInfo.setCustomValidity('');
        showError('');
    }

    commentInfo.reportValidity();
});

submitButton.addEventListener('click', () => {
    if (!checkName.validity.valid){
        addError('name', checkName.validationMessage);
    }
    if (!emailInfo.validity.valid){
        addError('email', emailInfo.validationMessage);
    }
    if (!commentInfo.validity.valid){
        addError('comment', commentInfo.validationMessage);
    }
});

contactForm.addEventListener('submit', () => {
    formErrors.value = JSON.stringify(form_errors);
});









