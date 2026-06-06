import { useEffect, useState } from 'react';
import type { ProfileFormSource } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearLatestSubmissionId,
  selectFormSubmissions,
  selectLatestSubmissionId,
} from '../store/profileFormsSlice';
import { Modal } from './Modal';
import { ReactHookProfileForm } from './ReactHookProfileForm';
import { UncontrolledProfileForm } from './UncontrolledProfileForm';

const highlightDurationMs = 3000;

const formTitles: Record<ProfileFormSource, string> = {
  'react-hook-form': 'React Hook Form profile form',
  uncontrolled: 'Uncontrolled profile form',
};

const sourceLabels: Record<ProfileFormSource, string> = {
  'react-hook-form': 'React Hook Form',
  uncontrolled: 'Uncontrolled',
};

export function ProfileFormsPanel() {
  const [activeForm, setActiveForm] = useState<ProfileFormSource | null>(null);
  const dispatch = useAppDispatch();
  const latestSubmissionId = useAppSelector(selectLatestSubmissionId);
  const submissions = useAppSelector(selectFormSubmissions);

  useEffect(() => {
    if (!latestSubmissionId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(clearLatestSubmissionId());
    }, highlightDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, latestSubmissionId]);

  const closeModal = () => setActiveForm(null);

  return (
    <section className="profile-forms-section" aria-labelledby="profile-forms-title">
      <div className="profile-forms-section__header">
        <div>
          <h2 id="profile-forms-title">Profile forms</h2>
          <p>Submit profile data with either form implementation.</p>
        </div>
        <div className="profile-forms-section__actions">
          <button type="button" onClick={() => setActiveForm('uncontrolled')}>
            Open uncontrolled form
          </button>
          <button
            type="button"
            onClick={() => setActiveForm('react-hook-form')}
          >
            Open React Hook Form
          </button>
        </div>
      </div>

      <div className="profile-submissions" aria-live="polite">
        <h3>Submitted profiles</h3>
        {submissions.length === 0 ? (
          <p className="profile-submissions__empty">No submissions yet.</p>
        ) : (
          <div className="profile-submissions__grid">
            {submissions.map((submission) => (
              <article
                className={
                  submission.id === latestSubmissionId
                    ? 'profile-submission-card profile-submission-card--latest'
                    : 'profile-submission-card'
                }
                key={submission.id}
              >
                <img
                  alt={`${submission.name} profile`}
                  className="profile-submission-card__image"
                  src={submission.imageBase64}
                />
                <div className="profile-submission-card__content">
                  <p className="profile-submission-card__source">
                    {sourceLabels[submission.source]}
                  </p>
                  <h4>{submission.name}</h4>
                  <dl className="profile-submission-card__details">
                    <div>
                      <dt>Age</dt>
                      <dd>{submission.age}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{submission.email}</dd>
                    </div>
                    <div>
                      <dt>Gender</dt>
                      <dd>{submission.gender}</dd>
                    </div>
                    <div>
                      <dt>Country</dt>
                      <dd>{submission.country}</dd>
                    </div>
                    <div>
                      <dt>Image</dt>
                      <dd>{submission.imageName}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {activeForm && (
        <Modal title={formTitles[activeForm]} onClose={closeModal}>
          {activeForm === 'uncontrolled' ? (
            <UncontrolledProfileForm onSuccess={closeModal} />
          ) : (
            <ReactHookProfileForm onSuccess={closeModal} />
          )}
        </Modal>
      )}
    </section>
  );
}
