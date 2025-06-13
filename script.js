document.getElementById('textForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const determinant = document.getElementById('determinant');
    const func = document.getElementById('function');
    const errorMessage = document.getElementById('error-message');
    const resultsBody = document.getElementById('results-body');
    
    // Сброс ошибок
    determinant.classList.remove('error');
    func.classList.remove('error');
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    // Функция валидации
    const validateSequence = (value, fieldName) => {
        if (!value.trim()) {
            return { valid: false, message: `${fieldName}: Введите хотя бы одну строку!` };
        }
        
        const strings = value.split(',').map(s => s.trim()).filter(s => s !== '');
        
        if (strings.length > 1 && !/,/.test(value)) {
            return { valid: false, message: `${fieldName}: Между строками должна быть хотя бы одна запятая!` };
        }
        
        const seen = {};
        for (const str of strings) {
            if (seen[str]) {
                return { 
                    valid: false, 
                    message: fieldName === 'Детерминанта' 
                        ? 'Детерминанта содержит повторяющиеся атрибуты!' 
                        : 'Функция содержит повторяющиеся атрибуты!'
                };
            }
            seen[str] = true;
        }
        
        for (const str of strings) {
            if (/\s/.test(str)) {
                return { valid: false, message: `${fieldName}: Строка "${str}" содержит пробелы!` };
            }
            
            if (str.length > 5) {
                return { valid: false, message: `${fieldName}: Строка "${str}" слишком длинная (макс. 5 символов)!` };
            }
        }
        
        return { valid: true, strings: strings };
    };
    
    // Проверка обоих полей
    const validationDet = validateSequence(determinant.value, 'Детерминанта');
    const validationFunc = validateSequence(func.value, 'Функция');
    
    // Собираем ошибки
    const errors = [];
    if (!validationDet.valid) errors.push(validationDet.message);
    if (!validationFunc.valid) errors.push(validationFunc.message);
    
    // Проверка на тривиальную зависимость (только если нет других ошибок)
    if (errors.length === 0) {
        const detStrings = validationDet.strings;
        const funcStrings = validationFunc.strings;
        
        // Проверка на функциональную зависимость внутри детерминанты
        if (detStrings.length > 1) {
            // Проверяем, есть ли в детерминанте атрибуты, которые функционально зависят друг от друга
            const hasInternalDependency = resultsBody.querySelectorAll('tr').some(row => {
                const cells = row.querySelectorAll('td');
                const rowDet = cells[0].textContent.split(',').map(s => s.trim());
                const rowFunc = cells[1].textContent.split(',').map(s => s.trim());
                
                // Проверяем, содержится ли какая-то ФЗ полностью внутри текущей детерминанты
                return rowDet.every(attr => detStrings.includes(attr)) && 
                       rowFunc.some(attr => detStrings.includes(attr));
            });
            
            if (hasInternalDependency) {
                errors.push('Функциональная зависимость внутри детерминанты!');
                determinant.classList.add('error');
            }
        }
        
        // Проверка тривиальной зависимости между детерминантой и функцией
        for (const attr of funcStrings) {
            if (detStrings.includes(attr)) {
                errors.push('Тривиальная функциональная зависимость!');
                determinant.classList.add('error');
                func.classList.add('error');
                break;
            }
        }
    }
    
    // Проверка на существующую ФЗ в таблице (только если нет других ошибок)
    if (errors.length === 0) {
        const detStr = validationDet.strings.sort().join(',');
        const funcStr = validationFunc.strings.sort().join(',');
        
        const rows = resultsBody.querySelectorAll('tr');
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            const rowDet = cells[0].textContent.split(',').map(s => s.trim()).sort().join(',');
            const rowFunc = cells[1].textContent.split(',').map(s => s.trim()).sort().join(',');
            
            if (rowDet === detStr && rowFunc === funcStr) {
                errors.push('Такая ФЗ уже есть!');
                determinant.classList.add('error');
                func.classList.add('error');
                break;
            }
        }
    }
    
    // Показываем ошибки
    if (errors.length > 0) {
        errorMessage.textContent = errors.join(' ');
        errorMessage.style.display = 'block';
        return;
    }
    
    // Если все проверки пройдены - добавляем данные в таблицу (в начало)
    const row = document.createElement('tr');
    
    const detCell = document.createElement('td');
    detCell.textContent = validationDet.strings.join(', ');
    row.appendChild(detCell);
    
    const funcCell = document.createElement('td');
    funcCell.textContent = validationFunc.strings.join(', ');
    row.appendChild(funcCell);
    
    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', function() {
        resultsBody.removeChild(row);
    });
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);
    
    // Добавляем строку в начало таблицы
    if (resultsBody.firstChild) {
        resultsBody.insertBefore(row, resultsBody.firstChild);
    } else {
        resultsBody.appendChild(row);
    }
    
    // Очищаем поля ввода
    determinant.value = '';
    func.value = '';
});