import React from 'react'
import './MobileFaq.css'
import BackButton from '../BackButton/BackButton'

const MobileFaq = () => {
  return (
    <section className='mobile-faq-container'>
        <BackButton /><br /><br />
        <h2>Frequently Asked Question</h2>
         <ul className="accordion">
<h3 style={{textAlign: 'left'}}>Tenants asked Question</h3>
          <li>
            <input type="checkbox" name="accordion" id="first"/>
            <label htmlFor="first">What is ARCE Housing Agency?</label>
            <div className="content">
                <p>
                   ARCE is a real estate platform designed to simplify how people find and rent homes in Nigeria. We connect renters directly with landlords or our verified agents — without the scams, inflated fees, or unreliable listings.
                </p>
            </div>
        </li>

          <li>
            <input type="checkbox" name="accordion" id="second"/>
            <label htmlFor="second">Do I have to pay any fees to use ARCE?</label>
            <div className="content">
                <p>
                    Yes — we charge a small, transparent 10% service fee. This helps us cover property inspections, platform maintenance, and staff wages. We never charge ridiculous agency fees or hidden costs.
                </p>
            </div>
        </li>

          <li>
            <input type="checkbox" name="accordion" id="third"/>
            <label htmlFor="third">Are the listings on ARCE verified?</label>
            <div className="content">
                <p>
                   Absolutely. Before any property is listed, our team conducts a physical inspection to confirm the location, condition, and authenticity. We only publish genuine, up-to-date listings with real images.
                </p>
            </div>
        </li>

          <li>
            <input type="checkbox" name="accordion" id="fourth"/>
            <label htmlFor="fourth">Can I pay my rent monthly instead of yearly?</label>
            <div className="content">
                <p>
                   Yes. ARCE supports flexible payment options like monthly, quarterly, or yearly rent — depending on what the landlord offers. We’re working to make housing more affordable and accessible.
                </p>
            </div>
        </li>

          <li>
            <input type="checkbox" name="accordion" id="fifth"/>
            <label htmlFor="fifth">What happens if I rent a place and it turns out different from the listing?</label>
            <div className="content">
                <p>
                   No worries — all listings on ARCE are verified by our inspection team. If anything goes wrong, you can report it immediately through our platform, and we’ll take action to protect your money and ensure accountability.
                </p>
            </div>
        </li><br />
<h3 style={{textAlign: 'left'}}>Landlords/Property Listers asked Question</h3>
        <li>
            <input type="checkbox" name="accordion" id="sixth"/>
            <label htmlFor="sixth">How do I list my property on ARCE?</label>
            <div className="content">
                <p>
                  To list your property, you’ll need to submit a request for inspection. Once verified by our team, we’ll create a trusted listing for you. This ensures only real, scam-free properties make it onto the platform.
                </p>
            </div>
        </li>
      <li>
            <input type="checkbox" name="accordion" id="seventh"/>
            <label htmlFor="seventh">Why do I need to verify my property before it gets listed?</label>
            <div className="content">
                <p>
                 Verification helps us build trust and safety on ARCE. It proves your property is legit, helps attract serious renters, and protects both your name and our platform from fraud or fake listings. It’s how we keep ARCE clean and credible.
                </p>
            </div>
        </li>
    </ul>
    </section>
  )
}

export default MobileFaq
