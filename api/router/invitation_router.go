package router

import (
	"net/http"
	"voltaserve/errorpkg"
	"voltaserve/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type InvitationRouter struct {
	invitationSvc *service.InvitationService
}

func NewInvitationRouter() *InvitationRouter {
	return &InvitationRouter{
		invitationSvc: service.NewInvitationService(),
	}
}

func (r *InvitationRouter) AppendRoutes(g fiber.Router) {
	g.Post("/", r.Create)
	g.Get("/get_incoming", r.GetIncoming)
	g.Get("/get_outgoing", r.GetOutgoing)
	g.Post("/:id/accept", r.Accept)
	g.Post("/:id/resend", r.Resend)
	g.Post("/:id/decline", r.Decline)
	g.Delete("/:id", r.Delete)
}

// Create godoc
//
//	@Summary		Create
//	@Description	Create
//	@Tags			Invitations
//	@Id				invitations_create
//	@Accept			json
//	@Produce		json
//	@Param			id		path		string							true	"ID"
//	@Param			body	body		core.InvitationCreateOptions	true	"Body"
//	@Failure		404		{object}	errorpkg.ErrorResponse
//	@Failure		400		{object}	errorpkg.ErrorResponse
//	@Failure		500		{object}	errorpkg.ErrorResponse
//	@Router			/invitations [post]
func (r *InvitationRouter) Create(c *fiber.Ctx) error {
	userID := GetUserID(c)
	req := new(service.InvitationCreateOptions)
	if err := c.BodyParser(req); err != nil {
		return err
	}
	if err := validator.New().Struct(req); err != nil {
		return errorpkg.NewRequestBodyValidationError(err)
	}
	if err := r.invitationSvc.Create(*req, userID); err != nil {
		return err
	}
	return c.SendStatus(http.StatusNoContent)
}

// GetIncoming godoc
//
//	@Summary		Get incoming
//	@Description	Get incoming
//	@Tags			Invitations
//	@Id				invitation_get_incoming
//	@Produce		json
//	@Success		200	{array}		core.Invitation
//	@Failure		500	{object}	errorpkg.ErrorResponse
//	@Router			/invitations/get_incoming [get]
func (r *InvitationRouter) GetIncoming(c *fiber.Ctx) error {
	userID := GetUserID(c)
	res, err := r.invitationSvc.GetIncoming(userID)
	if err != nil {
		return err
	}
	return c.JSON(res)
}

// GetOutgoing godoc
//
//	@Summary		Get outgoing
//	@Description	Get outgoing
//	@Tags			Invitations
//	@Id				invitation_get_outgoing
//	@Produce		json
//	@Param			organization_id	query		string	true	"Organization ID"
//	@Success		200				{array}		core.Invitation
//	@Failure		500				{object}	errorpkg.ErrorResponse
//	@Router			/invitations/get_outgoing [get]
func (r *InvitationRouter) GetOutgoing(c *fiber.Ctx) error {
	organizationID := c.Query("organization_id")
	if organizationID == "" {
		return errorpkg.NewMissingQueryParamError("organization_id")
	}
	userID := GetUserID(c)
	res, err := r.invitationSvc.GetOutgoing(organizationID, userID)
	if err != nil {
		return err
	}
	return c.JSON(res)
}

// Delete godoc
//
//	@Summary		Delete
//	@Description	Delete
//	@Tags			Invitations
//	@Id				invitations_delete
//	@Accept			json
//	@Produce		json
//	@Param			id	path		string	true	"ID"
//	@Failure		404	{object}	errorpkg.ErrorResponse
//	@Failure		400	{object}	errorpkg.ErrorResponse
//	@Failure		500	{object}	errorpkg.ErrorResponse
//	@Router			/invitations/{id} [delete]
func (r *InvitationRouter) Delete(c *fiber.Ctx) error {
	userID := GetUserID(c)
	if err := r.invitationSvc.Delete(c.Params("id"), userID); err != nil {
		return err
	}
	return c.SendStatus(http.StatusNoContent)
}

// Resend godoc
//
//	@Summary		Resend
//	@Description	Resend
//	@Tags			Invitations
//	@Id				invitations_resend
//	@Accept			json
//	@Produce		json
//	@Param			id	path		string	true	"ID"
//	@Failure		404	{object}	errorpkg.ErrorResponse
//	@Failure		400	{object}	errorpkg.ErrorResponse
//	@Failure		500	{object}	errorpkg.ErrorResponse
//	@Router			/invitations/{id}/resend [post]
func (r *InvitationRouter) Resend(c *fiber.Ctx) error {
	userID := GetUserID(c)
	if err := r.invitationSvc.Resend(c.Params("id"), userID); err != nil {
		return err
	}
	return c.SendStatus(http.StatusNoContent)
}

// Accept godoc
//
//	@Summary		Accept
//	@Description	Accept
//	@Tags			Invitations
//	@Id				invitation_accept
//	@Accept			json
//	@Produce		json
//	@Param			id	path		string	true	"ID"
//	@Failure		404	{object}	errorpkg.ErrorResponse
//	@Failure		400	{object}	errorpkg.ErrorResponse
//	@Failure		500	{object}	errorpkg.ErrorResponse
//	@Router			/invitations/{id}/accept [post]
func (r *InvitationRouter) Accept(c *fiber.Ctx) error {
	userID := GetUserID(c)
	if err := r.invitationSvc.Accept(c.Params("id"), userID); err != nil {
		return err
	}
	return c.SendStatus(http.StatusNoContent)
}

// Decline godoc
//
//	@Summary		Delete
//	@Description	Delete
//	@Tags			Invitations
//	@Id				invitations_decline
//	@Accept			json
//	@Produce		json
//	@Param			id	path		string	true	"ID"
//	@Failure		404	{object}	errorpkg.ErrorResponse
//	@Failure		400	{object}	errorpkg.ErrorResponse
//	@Failure		500	{object}	errorpkg.ErrorResponse
//	@Router			/invitations/{id}/decline [post]
func (r *InvitationRouter) Decline(c *fiber.Ctx) error {
	userID := GetUserID(c)
	if err := r.invitationSvc.Decline(c.Params("id"), userID); err != nil {
		return err
	}
	return c.SendStatus(http.StatusNoContent)
}
