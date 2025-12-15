document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scanForm');
    const resultCard = document.getElementById('resultCard');
    const inputCard = document.querySelector('.input-card');
    const resetBtn = document.getElementById('resetBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Analyzing...';
        submitBtn.disabled = true;

        const data = {
            company: document.getElementById('company').value,
            title: document.getElementById('title').value,
            email: document.getElementById('email').value,
            salary: document.getElementById('salary').value,
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            displayResult(result);

            inputCard.classList.add('hidden');
            resultCard.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while analyzing. Please try again.');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        resultCard.classList.add('hidden');
        inputCard.classList.remove('hidden');
    });

    function displayResult(result) {
        const riskIndicator = document.getElementById('riskIndicator');
        const riskLabel = document.getElementById('riskLabel');
        const confidenceScore = document.getElementById('confidenceScore');
        const reasonsList = document.getElementById('reasonsList');

        // Reset classes
        riskIndicator.className = 'risk-badge';

        // Set Class and Text based on prediction
        if (result.prediction === 'SCAM') {
            riskIndicator.classList.add('risk-scam');
            riskLabel.innerText = '🚨 HIGH RISK: SCAM DETECTED';
        } else if (result.prediction === 'SUSPICIOUS') {
            riskIndicator.classList.add('risk-suspicious');
            riskLabel.innerText = '⚠️ CAUTION: SUSPICIOUS';
        } else {
            riskIndicator.classList.add('risk-real');
            riskLabel.innerText = '✅ SAFE: LIKELY LEGITIMATE';
        }

        confidenceScore.innerText = result.confidence;

        // Populate reasons
        reasonsList.innerHTML = '';
        if (result.reasons && result.reasons.length > 0) {
            result.reasons.forEach(reason => {
                const li = document.createElement('li');
                li.innerText = reason;
                reasonsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.innerText = "No specific red flags detected.";
            reasonsList.appendChild(li);
        }
    }
});
