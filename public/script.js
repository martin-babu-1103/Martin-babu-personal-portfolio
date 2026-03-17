// Animate elements on scroll
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for fade-in animations
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Handle Blob cursor tracking
    const blob = document.getElementById("blob");
    document.body.onpointermove = event => {
        const { clientX, clientY } = event;

        blob.animate({
            left: `${clientX}px`,
            top: `${clientY}px`
        }, { duration: 3000, fill: "forwards" });
    }

    // Handle Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                formStatus.classList.remove('hidden');
                formStatus.style.marginTop = '1rem';
                formStatus.style.padding = '1rem';
                formStatus.style.borderRadius = '8px';

                if (result.success) {
                    formStatus.textContent = "Message sent successfully! Thank you.";
                    formStatus.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                    formStatus.style.color = '#4caf50';
                    formStatus.style.border = '1px solid #4caf50';
                    contactForm.reset();
                } else {
                    formStatus.textContent = "Failed to send message. Please try again.";
                    formStatus.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                    formStatus.style.color = '#f44336';
                    formStatus.style.border = '1px solid #f44336';
                }
            } catch (error) {
                console.error("Error submitting form", error);
                formStatus.classList.remove('hidden');
                formStatus.textContent = "A network error occurred. Please try again later.";
                formStatus.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                formStatus.style.color = '#f44336';
                formStatus.style.border = '1px solid #f44336';
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;

                // Hide status after 5 seconds
                setTimeout(() => {
                    formStatus.classList.add('hidden');
                }, 5000);
            }
        });
    }
});
