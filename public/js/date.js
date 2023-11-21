const dateFrom = document.querySelector('#date_form');

export const enteredDate = () => {
    dateFrom.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('email').value;
        return date;
    });
};
