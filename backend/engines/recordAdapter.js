const { projects, parcels } = require('../data/mockData');

function findParcel(identifier = {}) {
  const parcelId = String(identifier.parcelId || '').trim().toLowerCase();
  const surveyNumber = String(identifier.surveyNumber || '').trim().toLowerCase();
  return parcels.find((parcel) => (
    (parcelId && parcel.id.toLowerCase() === parcelId)
    || (surveyNumber && parcel.surveyNumber.toLowerCase() === surveyNumber)
  )) || null;
}

function findDefaultParcel() {
  return parcels.find((parcel) => parcel.id === 'PAR-1000') || parcels[0];
}

function getRecordSnapshot(parcel) {
  if (!parcel) return null;
  const project = projects.find((item) => item.id === parcel.projectId);
  return {
    source: 'Synthetic land record adapter',
    isSynthetic: true,
    parcelId: parcel.id,
    surveyNumber: parcel.surveyNumber,
    projectId: parcel.projectId,
    projectName: project?.name || parcel.projectId,
    district: parcel.district,
    village: parcel.village,
    owner: parcel.owner?.name || 'Synthetic owner unavailable',
    landArea: parcel.area,
    mutationStatus: parcel.titleRecords?.find((item) => item.type === 'Mutation register')?.status || 'Synthetic / unverified',
    registrationNumber: `SYN-REG-${parcel.id.replace(/^PAR-/, '')}`,
    registrationDate: parcel.awardDate,
    acquisitionStatus: parcel.acquisitionStatus,
    compensation: parcel.compensation,
    awardDate: parcel.awardDate,
    duplicateAcquisitionReference: null,
    recordValidation: parcel.validation,
    spatialStatus: parcel.geometry && parcel.coordinates ? 'available' : 'not-available'
  };
}

module.exports = { findParcel, findDefaultParcel, getRecordSnapshot };
