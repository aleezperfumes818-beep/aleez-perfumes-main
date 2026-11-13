--!strict
-- Ragdoll Manager for Hangout Game (R15 & R6 compatible)

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Network = require(ReplicatedStorage.Shared.Network)

local RagdollManager = {}

local ragdollStates = {}

local function setupRagdollJoints(character: Model)
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then return end

    for _, descendant in ipairs(character:GetDescendants()) do
        if descendant:IsA("Motor6D") and descendant.Name ~= "Root" and descendant.Name ~= "RootJoint" then
            local part0 = descendant.Part0
            local part1 = descendant.Part1
            if part0 and part1 then
                local a0Name = descendant.Name .. "Attachment0"
                local a1Name = descendant.Name .. "Attachment1"
                local socketName = descendant.Name .. "Socket"

                if not part0:FindFirstChild(a0Name) then
                    local a0 = Instance.new("Attachment")
                    a0.Name = a0Name
                    a0.CFrame = descendant.C0
                    a0.Parent = part0

                    local a1 = Instance.new("Attachment")
                    a1.Name = a1Name
                    a1.CFrame = descendant.C1
                    a1.Parent = part1

                    local socket = Instance.new("BallSocketConstraint")
                    socket.Name = socketName
                    socket.Attachment0 = a0
                    socket.Attachment1 = a1
                    socket.LimitsEnabled = true
                    socket.TwistLimitsEnabled = true
                    socket.UpperAngle = 45
                    socket.TwistLowerAngle = -45
                    socket.TwistUpperAngle = 45
                    socket.Enabled = false
                    socket.Parent = part0
                end
            end
        end
    end
end

function RagdollManager.setRagdoll(character: Model, enable: boolean)
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then return end

    if enable then
        setupRagdollJoints(character)
        humanoid.PlatformStand = true
        humanoid:ChangeState(Enum.HumanoidStateType.Ragdoll)

        for _, motor in ipairs(character:GetDescendants()) do
            if motor:IsA("Motor6D") and motor.Name ~= "Root" and motor.Name ~= "RootJoint" then
                motor.Enabled = false
            end
        end

        for _, socket in ipairs(character:GetDescendants()) do
            if socket:IsA("BallSocketConstraint") then
                socket.Enabled = true
            end
        end
    else
        for _, socket in ipairs(character:GetDescendants()) do
            if socket:IsA("BallSocketConstraint") then
                socket.Enabled = false
            end
        end

        for _, motor in ipairs(character:GetDescendants()) do
            if motor:IsA("Motor6D") then
                motor.Enabled = true
            end
        end

        humanoid.PlatformStand = false
        humanoid:ChangeState(Enum.HumanoidStateType.GettingUp)
    end
end

function RagdollManager.init()
    local toggleEvent = Network.getEvent("ToggleRagdoll")

    toggleEvent.OnServerEvent:Connect(function(player: Player)
        local character = player.Character
        if not character then return end

        local currentState = ragdollStates[player.UserId] or false
        local newState = not currentState
        ragdollStates[player.UserId] = newState

        RagdollManager.setRagdoll(character, newState)

        local notifEvent = Network.getEvent("Notification")
        if newState then
            notifEvent:FireClient(player, "🤸 Ragdoll ON (Click again to stand up)")
        else
            notifEvent:FireClient(player, "🧍 Ragdoll OFF")
        end
    end)
end

return RagdollManager
