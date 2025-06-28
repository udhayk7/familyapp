# CareLoop - Family Health Care Platform

A comprehensive medication reminder and health monitoring system designed for senior citizens, with real-time family caregiver oversight and AI-powered features.

## 🎯 Project Overview

This is **Module 1** of a 3-module healthcare platform built for a hackathon. CareLoop's Family/Caregiver Web App enables remote medication management, real-time monitoring, and emergency alerting for senior family members.

### 🏗️ Complete System Architecture

1. **Module 1: Family/Caregiver Web App** (This Repository) ✅
2. **Module 2: Senior Mobile/Tablet App** (Coming Next)
3. **Module 3: Doctor Dashboard** (Future Development)

## ✨ Features

### 🔐 Authentication & Security
- **Supabase Authentication** with phone/email OTP
- **Session Management** with automatic profile creation
- **Role-based Access Control** (family, senior, doctor)

### 👥 Senior Linking System
- **6-digit Linking Codes** for secure senior connections
- **Real-time Status Tracking** (pending, active, inactive)
- **Multiple Senior Management** for large families

### 💊 Medication Management
- **Complete CRUD Operations** for medications
- **Flexible Scheduling** with multiple daily times
- **Stock Level Monitoring** with low-stock alerts
- **Visual Progress Indicators** for pill counts

### 📊 Real-time Monitoring
- **Live Dashboard** with key metrics and trends
- **Compliance Tracking** with weekly charts
- **Activity Timeline** with recent events
- **Emergency Alert System** for missed doses

### 🤖 AI-Powered Features (Ready for Integration)
- **Voice Recognition** setup for "I took my medicine" detection
- **Camera Verification** infrastructure for pill intake confirmation
- **Symptom Detection** through voice analysis
- **Smart Alerting** based on patterns and behaviors

### 📱 Modern UI/UX
- **Responsive Design** for desktop, tablet, and mobile
- **Accessible Interface** designed for family caregivers
- **Real-time Notifications** with toast messaging
- **Interactive Charts** using Recharts

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend & Database
- **Supabase** (PostgreSQL + Real-time + Auth)
- **Row Level Security** for data protection
- **Real-time Subscriptions** for live updates

### UI Components
- **Custom Components** built with Tailwind
- **React Hot Toast** for notifications
- **Responsive Grid Layouts**
- **Mobile-first Design**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (already configured)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/udhayk7/familyapp.git
   cd familyapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The Supabase configuration is already included:
   - Project ID: `irzhvspbqqsonfmvyqil`
   - Public Key: Already configured in `src/lib/supabase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### For Family Caregivers

1. **Sign Up/Login**
   - Use email or phone number with OTP verification
   - Complete your caregiver profile

2. **Link a Senior**
   - Click "Link New Senior" to generate a 6-digit code
   - Share the code with your senior family member
   - They enter it in their senior app to establish connection

3. **Manage Medications**
   - Add medications with dosages and schedules
   - Set low-stock thresholds for refill alerts
   - Edit or remove medications as needed

4. **Monitor Adherence**
   - View real-time dashboard with compliance metrics
   - Check recent activity and missed doses
   - Receive alerts for emergencies or concerns

## 🗃️ Database Schema

### Core Tables
```sql
-- User profiles with role-based access
profiles (id, email, phone, role, full_name, avatar_url, created_at, updated_at)

-- Linking relationships between caregivers and seniors
user_links (id, family_id, senior_id, link_code, status, created_at, updated_at)

-- Medication information and schedules
medications (id, senior_id, name, dose, schedule_time, instructions, quantity_remaining, low_stock_threshold, is_active, created_at, updated_at)

-- Medication intake logs with verification
medication_logs (id, medication_id, senior_id, taken_at, verification_method, confidence_level, image_url, voice_note, status, created_at)

-- Health symptom reports
symptom_reports (id, senior_id, reported_by, symptoms, severity, notes, voice_note, is_resolved, created_at)

-- Communication messages
messages (id, sender_id, receiver_id, content, message_type, is_read, created_at)
```

## 🔮 AI Features (Integration Ready)

### Voice Recognition
- **Web Speech API** integration prepared
- **OpenAI Whisper** ready for advanced processing
- **Intent Detection** for medication confirmation

### Camera Verification
- **MediaPipe** setup for hand/object detection
- **TensorFlow.js** for pill recognition
- **Confidence Scoring** for verification accuracy

### Smart Alerts
- **Pattern Recognition** for missed dose detection
- **Emergency Escalation** for critical situations
- **Family Notification** system via SMS/email

## 📱 Mobile Responsiveness

- **Mobile-first Design** approach
- **Touch-friendly Interface** with proper tap targets
- **Responsive Navigation** with collapsible sidebar
- **Optimized Performance** for slower connections

## 🔒 Security Features

- **Supabase RLS** for data isolation
- **Encrypted Communications** between modules
- **Secure Code Generation** for senior linking
- **Session Management** with automatic logout

## 🚧 Development Roadmap

### Phase 1: Core Features ✅
- [x] Authentication system
- [x] Senior linking with codes
- [x] Medication CRUD operations
- [x] Dashboard with analytics
- [x] Responsive UI/UX

### Phase 2: Real-time Features (Next Sprint)
- [ ] Live medication reminder system
- [ ] Push notifications via Supabase Edge Functions
- [ ] Real-time senior activity monitoring
- [ ] Emergency alert escalation

### Phase 3: AI Integration (Future)
- [ ] Voice command processing
- [ ] Camera-based pill verification
- [ ] Symptom analysis and reporting
- [ ] Predictive health insights

## 🤝 Contributing

We welcome contributions to CareLoop! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with love for families caring for their senior loved ones. CareLoop bridges the gap between technology and compassionate care.

---

**CareLoop** - *Connecting families through smart health care*

# CareLoop Senior App - Phase 3

A senior-friendly mobile application with voice assistance and medication reminders that works in conjunction with the CareLoop family dashboard.

## Features

### 🎤 Voice Assistant
- **Wake Word Detection**: Say "Hey Google" or "Help me" to activate
- **Emergency Detection**: Automatically detects emergency keywords (pain, chest, dizzy, fall, etc.)
- **Smart Responses**: Provides appropriate responses and guidance
- **Family Notifications**: Automatically notifies family members of interactions

### 💊 Voice Medication Reminders
- **Voice Prompts**: Speaks medication reminders aloud
- **Voice Response**: Seniors can say "taken" or "stop" to respond
- **Multiple Attempts**: Up to 3 reminder attempts before notifying family
- **Automatic Logging**: Records medication adherence automatically

### 🆘 Emergency Features
- **Large Emergency Button**: Easy-to-press emergency call button
- **Voice Emergency Detection**: Detects emergency situations through voice
- **Immediate Family Notification**: Sends critical alerts to family dashboard

### 📱 Senior-Friendly Interface
- **Large Text and Buttons**: Easy to read and interact with
- **Simple Layout**: Minimal complexity, focused on essential features
- **Clear Instructions**: Built-in guidance on how to use features

## Architecture

### Cross-Platform Data Sync
- **Shared Database**: Uses the same Supabase database as the family dashboard
- **Real-time Sync**: Medication schedules and logs sync between apps
- **Bi-directional Notifications**: Senior app sends alerts to family dashboard

### Separate Applications
- **Senior App**: `localhost:3000` (this app)
- **Family Dashboard**: `localhost:3001/3002` (admin app)
- **When Hosted**: Can be deployed as separate domains (e.g., `app.yoursite.com` and `admin.yoursite.com`)

## Getting Started

### Prerequisites
- Node.js 18+ 
- Same Supabase database as the family dashboard

### Installation

1. **Clone and setup**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   The app is configured to use the same Supabase instance as the family dashboard for data synchronization.

3. **Run the app**:
   ```bash
   npm run dev
   ```
   
   The senior app will run on `http://localhost:3000`

### Browser Requirements
- **Chrome/Safari/Edge**: For Web Speech API support
- **HTTPS**: Required for speech recognition (works on localhost for development)
- **Microphone Permissions**: Must be granted for voice features

## Usage

### For Seniors

1. **Turn on Voice Assistant**: Click the speaker icon to enable voice listening
2. **Say Wake Words**: "Hey Google" or "Help me" to start talking
3. **Describe Issues**: Say things like "I have chest pain" or "I feel dizzy"
4. **Medication Reminders**: Respond with "taken" when you've taken medicine
5. **Emergency**: Press the red emergency button for immediate help

### For Family Members
- All interactions and medication logs appear in the family dashboard
- Emergency alerts are sent immediately with critical priority
- Regular voice interactions are logged for review

## Technical Details

### Voice Recognition
- Uses Web Speech API for speech-to-text
- Continuous listening when activated
- Automatic restart on errors
- Timeout handling for reliability

### Speech Synthesis
- Uses Web Speech Synthesis for text-to-speech
- Adjustable rate, pitch, and volume
- Clear pronunciation for seniors
- Interrupt and queue management

### Data Synchronization
- Real-time database updates via Supabase
- Medication schedules synced from family dashboard
- Logs and notifications sent to family app
- Offline-first design with sync when connected

### Security & Privacy
- No audio data stored (transcript only)
- Local speech processing (browser-based)
- Secure database connection via Supabase
- Emergency contact information protected

## Development

### Key Components
- `VoiceAssistant.tsx`: Wake word detection and command processing
- `MedicationReminder.tsx`: Voice-based medication reminder system
- `page.tsx`: Main senior interface

### Database Tables Used
- `medications`: Medication schedules (read from family app)
- `medication_logs`: Adherence tracking (written by senior app)
- `notifications`: Family notifications (written by senior app)
- `voice_logs`: Voice interaction history (written by senior app)

### Deployment Considerations
- Requires HTTPS for speech recognition in production
- Can be deployed separately from family dashboard
- Same database configuration as family app
- Mobile-responsive design for tablets/phones

## Future Enhancements
- Push notifications for medication reminders
- Video calling integration for emergencies
- Health vitals tracking
- Medication adherence analytics
- Caregiver chat integration
