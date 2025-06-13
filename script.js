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
        if (!value.trim()) return { valid: false, message: `${fieldName}: Введите хотя бы одну строку!` };
        
        const strings = value.split(',').map(s => s.trim()).filter(s => s !== '');
        
        if (strings.length > 1 && !/,/.test(value)) {
            return { valid: false, message: `${fieldName}: Между строками должна быть хотя бы одна запятая!` };
        }
        
        // Проверка на дубликаты
        const duplicates = strings.filter((item, index) => strings.indexOf(item) !== index);
        if (duplicates.length > 0) {
            return {
                valid: false,
                message: fieldName === 'Детерминанта' 
                    ? 'Детерминанта содержит повторяющиеся атрибуты!' 
                    : 'Функция содержит повторяющиеся атрибуты!'
            };
        }
        
        // Проверка формата строк
        for (const str of strings) {
            if (/\s/.test(str)) return { valid: false, message: `${fieldName}: Строка "${str}" содержит пробелы!` };
            if (str.length > 5) return { valid: false, message: `${fieldName}: Строка "${str}" слишком длинная!` };
        }
        
        return { valid: true, strings: strings.sort() }; // Сортируем для единообразия
    };
    
    // Валидация полей
    const validationDet = validateSequence(determinant.value, 'Детерминанта');
    const validationFunc = validateSequence(func.value, 'Функция');
    
    // Сбор ошибок
    const errors = [];
    if (!validationDet.valid) errors.push(validationDet.message);
    if (!validationFunc.valid) errors.push(validationFunc.message);
    
    // Проверка тривиальной зависимости
    if (errors.length === 0) {
        const common = validationDet.strings.filter(attr => validationFunc.strings.includes(attr));
        if (common.length > 0) {
            errors.push('Тривиальная функциональная зависимость!');
            determinant.classList.add('error');
            func.classList.add('error');
        }
    }
    
    // Проверка существующей ФЗ
    if (errors.length === 0) {
        const detKey = validationDet.strings.join(',');
        const funcKey = validationFunc.strings.join(',');
        
        const existingRows = Array.from(resultsBody.querySelectorAll('tr'));
        const isDuplicate = existingRows.some(row => {
            const cells = row.querySelectorAll('td');
            return cells[0].textContent.replace(/\s/g, '') === detKey && 
                   cells[1].textContent.replace(/\s/g, '') === funcKey;
        });
        
        if (isDuplicate) {
            errors.push('Такая ФЗ уже есть!');
            determinant.classList.add('error');
            func.classList.add('error');
        }
    }
    
    // Обработка ошибок
    if (errors.length > 0) {
        errorMessage.textContent = errors.join(' ');
        errorMessage.style.display = 'block';
        return;
    }
    
    // Добавление новой ФЗ
    const newRow = document.createElement('tr');
    const detCell = document.createElement('td');
    const funcCell = document.createElement('td');
    
    detCell.textContent = validationDet.strings.join(', ');
    funcCell.textContent = validationFunc.strings.join(', ');
    
    newRow.appendChild(detCell);
    newRow.appendChild(funcCell);
    resultsBody.appendChild(newRow);
    
    // Очистка полей
    determinant.value = '';
    func.value = '';
});