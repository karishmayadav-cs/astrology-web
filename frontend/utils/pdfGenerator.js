import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates and downloads a beautifully styled PDF report of the user's readings.
 * 
 * @param {Object} userData - User birth particulars { name, dob, tob, pob }
 * @param {Object} readingData - Structured JSON reading returned by the Groq API
 * @param {'Palm'|'Face'|'Future'} type - Reading category
 */
export async function generatePDFReport(userData, readingData, type = 'Palm') {
  if (!userData || !readingData) return;

  const pdfName = `${type}Reading_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

  // 1. Create a styled container off-screen
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '750px';
  container.style.color = '#ffffff';
  container.style.background = '#06040f'; // Dark cosmic theme
  container.style.fontFamily = "'Raleway', sans-serif";
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.boxSizing = 'border-box';

  // Inject styles to guarantee appearance in capture
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Raleway:wght@400;600;700&display=swap');
    .pdf-page {
      width: 750px;
      height: 1050px; /* A4 aspect ratio scale */
      padding: 50px 60px;
      box-sizing: border-box;
      position: relative;
      background: radial-gradient(circle at center, #0e0a29 0%, #05030d 100%);
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      justifyContent: space-between;
      page-break-after: always;
    }
    .pdf-header {
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.2);
      padding-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pdf-title-text {
      font-family: 'Cinzel', serif;
      color: #ffd700;
      font-size: 1.3rem;
      letter-spacing: 0.08em;
      margin: 0;
    }
    .pdf-subtitle-text {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .pdf-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.35);
    }
    .pdf-gold-hl {
      color: #ffd700;
      font-family: 'Cinzel', serif;
      font-weight: 600;
    }
    .pdf-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1.5px solid rgba(255, 255, 255, 0.05);
      border-left: 3px solid #ffd700;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .pdf-progress-track {
      background: rgba(255,255,255,0.06);
      height: 6px;
      border-radius: 3px;
      margin-top: 6px;
    }
  `;
  container.appendChild(style);

  // 2. Build Cover Page (Page 1)
  const page1 = document.createElement('div');
  page1.className = 'pdf-page';
  page1.style.justifyContent = 'center';
  page1.style.alignItems = 'center';
  page1.style.textAlign = 'center';
  page1.innerHTML = `
    <div style="border: 2px solid rgba(212, 175, 55, 0.35); padding: 50px 30px; border-radius: 20px; width: 85%; box-sizing: border-box; background: rgba(0,0,0,0.2);">
      <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🔮</span>
      <h1 style="font-family: 'Cinzel', serif; color: #ffd700; font-size: 2.4rem; letter-spacing: 0.12em; margin: 0 0 10px 0;">COSMIC SOUL</h1>
      <p style="font-size: 0.85rem; letter-spacing: 0.15em; color: rgba(255,255,255,0.6); text-transform: uppercase; margin: 0 0 35px 0;">Vedic Astrology &amp; Oracle Insights</p>
      
      <div style="width: 50px; height: 1.5px; background: #ffd700; margin: 0 auto 35px;"></div>
      
      <h2 style="font-family: 'Cinzel', serif; color: #ffffff; font-size: 1.4rem; letter-spacing: 0.08em; margin: 0 0 8px 0; text-transform: uppercase;">Personalized ${type} Reading</h2>
      <p style="font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0 0 50px 0; font-style: italic;">"Mapping your celestial blueprints onto earthly destiny"</p>
      
      <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; text-align: left; max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 0.9rem;"><span style="color: rgba(255,255,255,0.45);">Consultant:</span> <strong style="color: #fff; float: right;">${userData.name}</strong></div>
        <div style="font-size: 0.9rem;"><span style="color: rgba(255,255,255,0.45);">Date of Birth:</span> <strong style="color: #fff; float: right;">${userData.dob}</strong></div>
        <div style="font-size: 0.9rem;"><span style="color: rgba(255,255,255,0.45);">Time of Birth:</span> <strong style="color: #fff; float: right;">${userData.tob}</strong></div>
        <div style="font-size: 0.9rem;"><span style="color: rgba(255,255,255,0.45);">Place of Birth:</span> <strong style="color: #fff; float: right;">${userData.pob}</strong></div>
        <div style="font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 5px;"><span style="color: rgba(255,255,255,0.45);">Calculation Date:</span> <strong style="color: #ffd700; float: right;">${new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}</strong></div>
      </div>
    </div>
    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.25); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 30px;">
      ✦ CosmicSoul Oracle • Confidential Report ✦
    </div>
  `;
  container.appendChild(page1);

  // 3. Build Overview & Summary Page (Page 2)
  const page2 = document.createElement('div');
  page2.className = 'pdf-page';
  page2.innerHTML = `
    <div class="pdf-header">
      <div>
        <h3 class="pdf-title-text">CosmicSoul Blueprint</h3>
        <p class="pdf-subtitle-text">${type} Reading Summary</p>
      </div>
      <div style="font-size:0.75rem; color:rgba(255,255,255,0.4);">PAGE 2</div>
    </div>

    <div style="margin: 40px 0; flex: 1;">
      <div style="display: flex; gap: 30px; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 25px; border-radius: 16px; margin-bottom: 30px;">
        <div style="width: 110px; height: 110px; border-radius: 50%; border: 4px solid #ffd700; display: flex; flex-direction: column; align-items: center; justifyContent: center; background: rgba(0,0,0,0.3); box-shadow: 0 0 10px rgba(212,175,55,0.2);">
          <span style="font-size: 1.6rem; font-weight: bold; color: #fff; font-family:'Cinzel',serif; line-height: 1;">${readingData.overallScore}%</span>
          <span style="font-size: 0.55rem; color: rgba(255,255,255,0.4); letter-spacing: 0.05em; font-weight: bold; margin-top: 2px;">SCORE</span>
        </div>
        <div style="flex: 1;">
          <span style="font-size: 0.75rem; color: #ffd700; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'Cinzel', serif;">Archetype Profile</span>
          <h3 style="margin: 2px 0 8px 0; font-family: 'Cinzel', serif; font-size: 1.3rem;">${readingData.personalityType}</h3>
          <p style="font-size: 0.88rem; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0;">${readingData.summary}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background: rgba(78, 205, 196, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.04); border-left: 3px solid #4ECDC4; padding: 20px; border-radius: 12px;">
          <h4 style="font-family:'Cinzel',serif; color:#4ECDC4; font-size:0.9rem; margin:0 0 10px 0;">✦ Character Strengths</h4>
          <ul style="padding-left: 18px; margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.8); line-height: 1.6;">
            ${readingData.strengths && readingData.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div style="background: rgba(255, 107, 107, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.04); border-left: 3px solid #FF6B6B; padding: 20px; border-radius: 12px;">
          <h4 style="font-family:'Cinzel',serif; color:#FF6B6B; font-size:0.9rem; margin:0 0 10px 0;">✦ Astrological Warnings</h4>
          <ul style="padding-left: 18px; margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.8); line-height: 1.6;">
            ${readingData.weaknesses && readingData.weaknesses.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="background: rgba(212, 175, 55, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.04); border-left: 3px solid #ffd700; padding: 20px; border-radius: 12px;">
        <h4 style="font-family:'Cinzel',serif; color:#ffd700; font-size:0.9rem; margin:0 0 10px 0;">✦ Recommendations for the Year Ahead</h4>
        <ul style="padding-left: 18px; margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.85); line-height: 1.6;">
          ${readingData.recommendations && readingData.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="pdf-footer">
      <span>✦ CosmicSoul.com</span>
      <span>Vedic Interpretations</span>
    </div>
  `;
  container.appendChild(page2);

  // 4. Build Detailed Readings (Page 3)
  const page3 = document.createElement('div');
  page3.className = 'pdf-page';
  
  let cardsHTML = '';
  if (readingData.lines) {
    cardsHTML = Object.entries(readingData.lines).map(([key, item]) => {
      const displayName = key.replace(/Line$/, ' Line').replace(/^\w/, c => c.toUpperCase());
      const itemColor = item.color || '#ffd700';
      return `
        <div class="pdf-card" style="border-left-color: ${itemColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-family: 'Cinzel', serif; font-size: 0.95rem; color: ${itemColor};">${displayName}</strong>
            <span style="font-size: 0.85rem; color: ${itemColor}; font-weight: bold;">${item.score}% Strength</span>
          </div>
          <div class="pdf-progress-track">
            <div style="background:${itemColor}; width:${item.score}%; height:100%; border-radius:3px;"></div>
          </div>
          <p style="font-size: 0.8rem; line-height: 1.5; color: rgba(255,255,255,0.85); margin: 10px 0 0 0;">
            <strong>Analysis:</strong> ${item.shortDescription}. ${item.fullReading.substring(0, 150)}...
          </p>
        </div>
      `;
    }).join('');
  } else if (readingData.categories) {
    // If it is a future prediction page
    cardsHTML = Object.entries(readingData.categories).map(([key, item]) => {
      const itemColor = item.color || '#ffd700';
      return `
        <div class="pdf-card" style="border-left-color: ${itemColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-family: 'Cinzel', serif; font-size: 0.95rem; color: ${itemColor};">${item.title}</strong>
            <span style="font-size: 0.85rem; color: ${itemColor}; font-weight: bold;">${item.score}% Alignment</span>
          </div>
          <div class="pdf-progress-track">
            <div style="background:${itemColor}; width:${item.score}%; height:100%; border-radius:3px;"></div>
          </div>
          <p style="font-size: 0.8rem; line-height: 1.5; color: rgba(255,255,255,0.85); margin: 10px 0 0 0;">
            <strong>Prediction:</strong> ${item.prediction.substring(0, 160)}...
          </p>
        </div>
      `;
    }).join('');
  }

  page3.innerHTML = `
    <div class="pdf-header">
      <div>
        <h3 class="pdf-title-text">CosmicSoul Mapping</h3>
        <p class="pdf-subtitle-text">Detailed Attribute Analysis</p>
      </div>
      <div style="font-size:0.75rem; color:rgba(255,255,255,0.4);">PAGE 3</div>
    </div>

    <div style="margin: 30px 0; flex: 1;">
      ${cardsHTML}
    </div>

    <div class="pdf-footer">
      <span>✦ CosmicSoul.com</span>
      <span>Astrological Matrix</span>
    </div>
  `;
  container.appendChild(page3);

  // 5. Build Timeline & Elements (Page 4)
  const page4 = document.createElement('div');
  page4.className = 'pdf-page';

  let luckyItemsHTML = '';
  if (readingData.luckyElements) {
    const le = readingData.luckyElements;
    luckyItemsHTML = `
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 30px; text-align: center;">
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px 6px; border-radius: 8px; border-bottom: 3px solid #9B59B6;">
          <div style="font-size: 1.2rem; margin-bottom: 4px;">#</div>
          <strong style="font-size: 0.8rem; display: block; color: #fff; font-family:'Cinzel',serif;">${Array.isArray(le.numbers) ? le.numbers.join(', ') : le.numbers}</strong>
          <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">Numbers</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px 6px; border-radius: 8px; border-bottom: 3px solid #4ECDC4;">
          <div style="font-size: 1.2rem; margin-bottom: 4px;">🟢</div>
          <strong style="font-size: 0.8rem; display: block; color: #fff; font-family:'Cinzel',serif;">${Array.isArray(le.colors) ? le.colors.join(', ') : le.colors}</strong>
          <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">Colors</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px 6px; border-radius: 8px; border-bottom: 3px solid #FFD700;">
          <div style="font-size: 1.2rem; margin-bottom: 4px;">💎</div>
          <strong style="font-size: 0.8rem; display: block; color: #fff; font-family:'Cinzel',serif;">${Array.isArray(le.stones) ? le.stones.join(', ') : le.stones}</strong>
          <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">Stone</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px 6px; border-radius: 8px; border-bottom: 3px solid #FF1493;">
          <div style="font-size: 1.2rem; margin-bottom: 4px;">📅</div>
          <strong style="font-size: 0.8rem; display: block; color: #fff; font-family:'Cinzel',serif;">${Array.isArray(le.days) ? le.days.join(', ') : le.days}</strong>
          <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">Days</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px 6px; border-radius: 8px; border-bottom: 3px solid #FF6B6B;">
          <div style="font-size: 1.2rem; margin-bottom: 4px;">🧭</div>
          <strong style="font-size: 0.8rem; display: block; color: #fff; font-family:'Cinzel',serif;">${le.direction}</strong>
          <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase;">Direction</span>
        </div>
      </div>
    `;
  }

  let predictionsTimelineHTML = '';
  if (readingData.futurePredictions) {
    const fp = readingData.futurePredictions;
    predictionsTimelineHTML = `
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-left: 3px solid #FF6B6B; padding: 15px; border-radius: 8px;">
          <span style="font-size: 0.75rem; color: #FF6B6B; font-weight: 700; text-transform: uppercase;">${fp.shortTerm.period}</span>
          <h4 style="margin: 2px 0 6px 0; font-family:'Cinzel',serif; font-size:0.9rem; color:#fff;">Short-Term Forecast</h4>
          <p style="font-size: 0.8rem; line-height: 1.5; color: rgba(255,255,255,0.8); margin: 0;">${fp.shortTerm.prediction}</p>
        </div>
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-left: 3px solid #FF1493; padding: 15px; border-radius: 8px;">
          <span style="font-size: 0.75rem; color: #FF1493; font-weight: 700; text-transform: uppercase;">${fp.mediumTerm.period}</span>
          <h4 style="margin: 2px 0 6px 0; font-family:'Cinzel',serif; font-size:0.9rem; color:#fff;">Medium-Term Forecast</h4>
          <p style="font-size: 0.8rem; line-height: 1.5; color: rgba(255,255,255,0.8); margin: 0;">${fp.mediumTerm.prediction}</p>
        </div>
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-left: 3px solid #9B59B6; padding: 15px; border-radius: 8px;">
          <span style="font-size: 0.75rem; color: #9B59B6; font-weight: 700; text-transform: uppercase;">${fp.longTerm.period}</span>
          <h4 style="margin: 2px 0 6px 0; font-family:'Cinzel',serif; font-size:0.9rem; color:#fff;">Long-Term Forecast</h4>
          <p style="font-size: 0.8rem; line-height: 1.5; color: rgba(255,255,255,0.8); margin: 0;">${fp.longTerm.prediction}</p>
        </div>
      </div>
    `;
  }

  page4.innerHTML = `
    <div class="pdf-header">
      <div>
        <h3 class="pdf-title-text">CosmicSoul Almanac</h3>
        <p class="pdf-subtitle-text">Lucky Parameters &amp; Milestones</p>
      </div>
      <div style="font-size:0.75rem; color:rgba(255,255,255,0.4);">PAGE 4</div>
    </div>

    <div style="margin: 30px 0; flex: 1; display: flex; flexDirection: column; justifyContent: space-between;">
      <div>
        <h4 style="font-family:'Cinzel',serif; color:#ffd700; font-size:0.95rem; margin:0 0 15px 0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">✦ Auspicious Configurations</h4>
        ${luckyItemsHTML}
      </div>

      <div style="margin-top: 20px;">
        <h4 style="font-family:'Cinzel',serif; color:#ffd700; font-size:0.95rem; margin:0 0 15px 0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">✦ Timeline Milestones</h4>
        ${predictionsTimelineHTML}
      </div>
    </div>

    <div class="pdf-footer">
      <span>✦ CosmicSoul.com</span>
      <span>Oracle Dispatch • Disclaimer: For spiritual reflection only</span>
    </div>
  `;
  container.appendChild(page4);

  // 6. Append container to document body temporarily
  document.body.appendChild(container);

  // 7. Initialize jsPDF
  const doc = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = 297; // A4 height in mm

  try {
    // 8. Capture each page and add to PDF
    const pages = [page1, page2, page3, page4];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2, // High resolution device pixel ratio
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#06040f'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        doc.addPage();
      }
      doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    }

    // 9. Save file
    doc.save(`${pdfName}.pdf`);
  } catch (err) {
    console.error('PDF Capture error:', err);
    throw err;
  } finally {
    // 10. Cleanup
    document.body.removeChild(container);
  }
}
