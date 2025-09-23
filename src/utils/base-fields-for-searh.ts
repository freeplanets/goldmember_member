export const MEMBER_DEFAULT_FIELDS = 'id name displayName membershipType announcementReadTs pic gender isDirector joinDate handicap birthDate';
export const MEMBER_DETAIL_FIELDS = `${MEMBER_DEFAULT_FIELDS}  phone email creditScore`;
export const TEAM_DEFAULT_FIELDS = 'id name status logoUrl description contacter';
export const TEAM_DETAIL_FIELDS = `${TEAM_DEFAULT_FIELDS} lastActivity members creditScore`;