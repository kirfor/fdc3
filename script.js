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
            return { valid: false, message: `${fieldName}: Введите хотя бы один атрибут!` };
        }
        
        const strings = value.split(',').map(s => s.trim()).filter(s => s !== '');
        
        if (strings.length > 1 && !/,/.test(value)) {
            return { valid: false, message: `${fieldName}: Разделяйте атрибуты запятыми!` };
        }
        
        const seen = {};
        for (const str of strings) {
            if (seen[str]) {
                return { 
                    valid: false, 
                    message: `${fieldName}: Атрибут "${str}" повторяется!`
                };
            }
            seen[str] = true;
        }
        
        for (const str of strings) {
            if (/\s/.test(str)) {
                return { valid: false, message: `${fieldName}: Атрибут "${str}" содержит пробелы!` };
            }
            
            if (str.length > 5) {
                return { valid: false, message: `${fieldName}: Атрибут "${str}" слишком длинный!` };
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
    
    // Проверка на тривиальную зависимость (восстановленная)
    if (errors.length === 0) {
        const detStrings = validationDet.strings;
        const funcStrings = validationFunc.strings;
        
        // Проверяем каждый атрибут функции на наличие в детерминанте
        for (const funcAttr of funcStrings) {
            if (detStrings.includes(funcAttr)) {
                errors.push(`Тривиальная зависимость: атрибут ${funcAttr} содержится в детерминанте!`);
                determinant.classList.add('error');
                func.classList.add('error');
                break;
            }
        }
    }
    
    // Проверка на существующую ФЗ
    if (errors.length === 0) {
        const detStr = validationDet.strings.sort().join(',');
        const funcStr = validationFunc.strings.sort().join(',');
        
        const rows = resultsBody.querySelectorAll('.fz-row');
        for (const row of rows) {
            const cells = row.querySelectorAll('div');
            const rowDet = cells[0].textContent.split(',').map(s => s.trim()).sort().join(',');
            const rowFunc = cells[1].textContent.split(',').map(s => s.trim()).sort().join(',');
            
            if (rowDet === detStr && rowFunc === funcStr) {
                errors.push('Такая ФЗ уже существует!');
                determinant.classList.add('error');
                func.classList.add('error');
                break;
            }
        }
    }
    
    // Улучшенная проверка на нарушение нормальных форм
    if (errors.length === 0) {
        const newDetSet = new Set(validationDet.strings);
        const newFuncSet = new Set(validationFunc.strings);
        
        const rows = resultsBody.querySelectorAll('.fz-row');
        for (const row of rows) {
            const cells = row.querySelectorAll('div');
            const rowDet = cells[0].textContent.split(',').map(s => s.trim());
            const rowFunc = cells[1].textContent.split(',').map(s => s.trim());
            
            const rowDetSet = new Set(rowDet);
            const rowFuncSet = new Set(rowFunc);
            
            // 1. Проверка: если детерминанта существующей ФЗ содержится в новой детерминанте
            // и функция существующей ФЗ пересекается с новой детерминантой
            const existingInNew = rowDet.every(attr => newDetSet.has(attr)) && 
                               rowFunc.some(attr => newDetSet.has(attr));
            
            // 2. Проверка: если детерминанта новой ФЗ содержится в существующей детерминанте
            // и функция новой ФЗ пересекается с существующей детерминантой
            const newInExisting = validationDet.strings.every(attr => rowDetSet.has(attr)) && 
                                validationFunc.strings.some(attr => rowDetSet.has(attr));
            
            if (existingInNew || newInExisting) {
                errors.push('Нарушение: ФЗ пересекается с существующей детерминантой!');
                determinant.classList.add('error');
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
    
    // Добавляем новую ФЗ
    const row = document.createElement('div');
    row.className = 'fz-row';
    
    const detCell = document.createElement('div');
    detCell.textContent = validationDet.strings.join(', ');
    row.appendChild(detCell);
    
    const funcCell = document.createElement('div');
    funcCell.textContent = validationFunc.strings.join(', ');
    row.appendChild(funcCell);
    
    const actionCell = document.createElement('div');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', function() {
        row.remove();
    });
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);
    
    // Добавляем в начало таблицы
    resultsBody.insertBefore(row, resultsBody.firstChild);
    
    // Очищаем поля ввода
    determinant.value = '';
    func.value = '';
});