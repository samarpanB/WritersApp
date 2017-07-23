var JobStatus = {
	Active: "Active",
	InProgress: "InProgress",
	Done: "Done",
	ExpertRejected: "ExpertRejected",
	CustomerRejected: "CustomerRejected",
	ExpertApproved: "ExpertApproved",
	CustomerApproved: "CustomerApproved"
};

exports.JobStatus = JobStatus;
exports.JobStatusEnum = [
	JobStatus.Active,
	JobStatus.InProgress,
	JobStatus.Done,
	JobStatus.ExpertRejected,
	JobStatus.CustomerRejected,
	JobStatus.ExpertApproved,
	JobStatus.CustomerApproved
];